from datetime import datetime
from decimal import Decimal
import csv
import io
from ..models import (
    FuelOrder,
    FuelOrderStatus,
    Aircraft,
    User,
    UserRole,
    FuelTruck,
    Customer
)
from ..extensions import db
from flask import current_app
from typing import Optional, Tuple, List, Dict, Any

class FuelOrderService:
    @classmethod
    def create_fuel_order(cls, order_data: dict) -> tuple[FuelOrder | None, str | None]:
        """
        Create a new fuel order after validating all required entities exist and are valid.
        
        Args:
            order_data (dict): Dictionary containing the validated order data from the route handler
                Required keys:
                - tail_number (str): Aircraft tail number
                - fuel_type (str): Type of fuel to be dispensed
                - assigned_lst_user_id (int): ID of the LST user assigned to the order
                - assigned_truck_id (int): ID of the fuel truck assigned to the order
                Optional keys:
                - customer_id (int): ID of the customer if applicable
                - additive_requested (bool): Whether fuel additive was requested
                - requested_amount (float): Amount of fuel requested
                - location_on_ramp (str): Location of the aircraft on the ramp
                - csr_notes (str): Notes from the CSR
                
        Returns:
            tuple[FuelOrder | None, str | None]: Returns either:
                - (FuelOrder, None) on success
                - (None, error_message) on failure
        """
        # Extract required fields
        tail_number = order_data.get('tail_number')
        fuel_type = order_data.get('fuel_type')
        assigned_lst_user_id = order_data.get('assigned_lst_user_id')
        assigned_truck_id = order_data.get('assigned_truck_id')
        customer_id = order_data.get('customer_id')

        # Check for required fields
        if not all([tail_number, fuel_type, assigned_lst_user_id, assigned_truck_id]):
            return None, "Missing required fields: tail_number, fuel_type, assigned_lst_user_id, and assigned_truck_id are required"

        # Check if aircraft exists
        aircraft = Aircraft.query.get(tail_number)
        if not aircraft:
            return None, f"Aircraft with tail number {tail_number} not found"

        # Check if LST user exists and is valid
        lst_user = User.query.get(assigned_lst_user_id)
        if not lst_user:
            return None, f"User with ID {assigned_lst_user_id} not found"
        if lst_user.role != UserRole.LST:
            return None, f"User {assigned_lst_user_id} is not an LST"
        if not lst_user.is_active:
            return None, f"LST user {assigned_lst_user_id} is not active"

        # Check if fuel truck exists and is active
        truck = FuelTruck.query.get(assigned_truck_id)
        if not truck:
            return None, f"Fuel truck with ID {assigned_truck_id} not found"
        if not truck.is_active:
            return None, f"Fuel truck {assigned_truck_id} is not active"

        # Check customer if provided
        if customer_id:
            customer = Customer.query.get(customer_id)
            if not customer:
                return None, f"Customer with ID {customer_id} not found"

        # Create new FuelOrder instance
        try:
            new_order = FuelOrder(
                tail_number=tail_number,
                fuel_type=fuel_type,
                assigned_lst_user_id=assigned_lst_user_id,
                assigned_truck_id=assigned_truck_id,
                customer_id=customer_id,  # This is optional, will be None if not provided
                additive_requested=order_data.get('additive_requested', False),
                requested_amount=order_data.get('requested_amount'),
                location_on_ramp=order_data.get('location_on_ramp'),
                csr_notes=order_data.get('csr_notes'),
                # Set initial status and timestamps
                status=FuelOrderStatus.DISPATCHED,
                dispatch_timestamp=datetime.utcnow()
                # created_at will be set automatically by model default
            )

            # Add and commit to database
            db.session.add(new_order)
            db.session.commit()
            
            return new_order, None  # Return the created order with no error message
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating fuel order: {str(e)}")
            return None, f"Database error while creating fuel order: {str(e)}"

    @classmethod
    def get_fuel_orders(
        cls,
        current_user: User,
        filters: Optional[Dict[str, Any]] = None
    ) -> Tuple[Optional[Any], str]:
        """
        Retrieve paginated fuel orders based on user role and optional filters.
        
        Args:
            current_user (User): The authenticated user making the request
            filters (Optional[Dict[str, Any]]): Optional dictionary containing filter parameters
                - status (str): Filter by order status
                - page (int): Page number (default: 1)
                - per_page (int): Items per page (default: 20, max: 100)
                - Other filters can be added as needed
        
        Returns:
            Tuple[Optional[Any], str]: A tuple containing:
                - Pagination object if successful (contains items, page metadata), None if error
                - Success/error message
        """
        # Initialize base query
        query = FuelOrder.query

        # Apply role-based filtering
        if current_user.role == UserRole.LST:
            # LSTs can only see orders assigned to them
            query = query.filter(FuelOrder.assigned_lst_user_id == current_user.id)
        elif current_user.role in [UserRole.CSR, UserRole.ADMIN]:
            # CSRs and Admins can see all orders
            pass
        else:
            current_app.logger.error(f"Unexpected user role encountered: {current_user.role}")
            return None, "Forbidden: User role cannot access orders"
        
        # Apply filtering based on request parameters
        if filters:
            # Filter by status
            status_filter = filters.get('status')
            if status_filter:
                try:
                    # Convert string status from filter to FuelOrderStatus enum member
                    status_enum = FuelOrderStatus[status_filter.upper()]
                    query = query.filter(FuelOrder.status == status_enum)
                except KeyError:
                    # Invalid status string provided in filter
                    return None, f"Invalid status value provided: {status_filter}"

            # TODO: Add other filters here (e.g., date range, tail_number)

        # Extract and validate pagination parameters
        try:
            page = int(filters.get('page', 1))
            per_page = int(filters.get('per_page', 20))
            
            # Validate pagination parameters
            if page < 1:
                page = 1
            if per_page < 1:
                per_page = 20
            if per_page > 100:  # Maximum limit to prevent abuse
                per_page = 100
                
        except (ValueError, TypeError):
            # Handle invalid pagination parameters
            page = 1
            per_page = 20

        try:
            # Apply default sorting and pagination
            paginated_orders = query.order_by(FuelOrder.created_at.desc()).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            return paginated_orders, "Orders retrieved successfully"
            
        except Exception as e:
            current_app.logger.error(f"Error retrieving fuel orders: {str(e)}")
            return None, f"Database error while retrieving orders: {str(e)}"

    @classmethod
    def get_fuel_order_by_id(
        cls,
        order_id: int,
        current_user: User
    ) -> Tuple[Optional[FuelOrder], str, int]:
        """
        Retrieve a specific fuel order by ID after performing authorization checks.
        
        Args:
            order_id (int): The ID of the order to retrieve
            current_user (User): The authenticated user making the request
            
        Returns:
            Tuple[Optional[FuelOrder], str, int]: A tuple containing:
                - The FuelOrder if successful, None if failed
                - A success/error message
                - HTTP status code (200, 403, 404)
        """
        # Basic fetch for now. Add joinedload/selectinload options later for optimization if needed.
        order = FuelOrder.query.get(order_id)
        if not order:
            return None, f"Fuel order with ID {order_id} not found.", 404  # Not Found

        # Perform Authorization Check
        if current_user.role == UserRole.LST:
            # LST can only view orders assigned to them
            if order.assigned_lst_user_id != current_user.id:
                return None, "Forbidden: You are not assigned to this fuel order.", 403  # Forbidden
        elif current_user.role in [UserRole.CSR, UserRole.ADMIN]:
            # CSRs and Admins can view any order
            pass  # No additional check needed for these roles
        else:
            # Should not happen due to auth middleware, but let's be thorough
            return None, "Forbidden: Invalid user role.", 403

        # Return the order object
        return order, "Fuel order retrieved successfully.", 200  # OK

    @classmethod
    def update_order_status(
        cls,
        order_id: int,
        new_status: FuelOrderStatus,
        current_user: User
    ) -> Tuple[Optional[FuelOrder], str, int]:
        """
        Update the status of a fuel order after performing authorization checks.
        
        Args:
            order_id (int): The ID of the order to update
            new_status (FuelOrderStatus): The target status to update to
            current_user (User): The authenticated user performing the action
            
        Returns:
            Tuple[Optional[FuelOrder], str, int]: A tuple containing:
                - The updated FuelOrder if successful, None if failed
                - A success/error message
                - HTTP status code (200, 403, 404)
        """
        # Fetch the fuel order by ID
        order = FuelOrder.query.get(order_id)
        if not order:
            return None, f"Fuel order with ID {order_id} not found.", 404  # Not Found

        # Check if the user is the assigned LST for this order
        if current_user.role == UserRole.LST:
            if order.assigned_lst_user_id != current_user.id:
                return None, "Forbidden: You are not assigned to this fuel order.", 403  # Forbidden
        elif current_user.role in [UserRole.CSR, UserRole.ADMIN]:
            # Restrict status changes strictly to LSTs for MVP workflow
            return None, "Forbidden: Only the assigned LST can update the status via this method.", 403
        else:
            # Should not happen due to auth middleware, but let's be thorough
            return None, "Forbidden: Invalid user role.", 403

        # Define allowed transitions for LST updates via this endpoint
        allowed_transitions = {
            FuelOrderStatus.DISPATCHED: [FuelOrderStatus.ACKNOWLEDGED],
            FuelOrderStatus.ACKNOWLEDGED: [FuelOrderStatus.EN_ROUTE],
            FuelOrderStatus.EN_ROUTE: [FuelOrderStatus.FUELING]
            # Note: Fueling -> Completed will be handled by a separate 'complete_order' endpoint
            # Note: Cancellation will be handled by a separate endpoint with different permissions
        }

        # Validate the requested transition
        if order.status not in allowed_transitions or new_status not in allowed_transitions[order.status]:
            return None, f"Invalid status transition from {order.status.value} to {new_status.value}.", 400  # Bad Request

        try:
            # Update the order status
            order.status = new_status

            # Update corresponding timestamp field based on the new status
            if new_status == FuelOrderStatus.ACKNOWLEDGED:
                order.acknowledge_timestamp = datetime.utcnow()
            elif new_status == FuelOrderStatus.EN_ROUTE:
                order.en_route_timestamp = datetime.utcnow()
            elif new_status == FuelOrderStatus.FUELING:
                order.fueling_start_timestamp = datetime.utcnow()

            # Commit the changes
            db.session.commit()

            return order, f"Order status successfully updated to {new_status.value}.", 200  # OK

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating fuel order status: {str(e)}")
            return None, f"Database error while updating order status: {str(e)}", 500  # Internal Server Error

    @classmethod
    def complete_fuel_order(
        cls,
        order_id: int,
        completion_data: Dict[str, Any],
        current_user: User
    ) -> Tuple[Optional[FuelOrder], str, int]:
        """
        Complete a fuel order by updating its status and recording completion details.
        
        Args:
            order_id (int): The ID of the order to complete
            completion_data (Dict[str, Any]): Dictionary containing completion details
                Required keys:
                - start_meter_reading (str/Decimal): Starting meter reading
                - end_meter_reading (str/Decimal): Ending meter reading
                Optional keys:
                - lst_notes (str): Additional notes from the LST
            current_user (User): The authenticated user performing the action
            
        Returns:
            Tuple[Optional[FuelOrder], str, int]: A tuple containing:
                - The updated FuelOrder if successful, None if failed
                - A success/error message
                - HTTP status code (200, 400, 403, 404)
        """
        # Fetch the fuel order by ID
        order = FuelOrder.query.get(order_id)
        if not order:
            return None, f"Fuel order with ID {order_id} not found.", 404  # Not Found

        # Perform Authorization Check: Ensure the user is the assigned LST
        if not (current_user.role == UserRole.LST and order.assigned_lst_user_id == current_user.id):
            # Also allow Admin/CSR maybe? For MVP, let's stick to LST.
            return None, "Forbidden: Only the assigned LST can complete this fuel order.", 403  # Forbidden

        # Perform Status Check: Ensure the order is in a state ready for completion
        if order.status != FuelOrderStatus.FUELING:
            # We could allow completion from other states like EN_ROUTE, ACKNOWLEDGED
            # but requiring FUELING enforces the workflow more strictly.
            return None, f"Order cannot be completed from its current status ({order.status.value}). Must be 'Fueling'.", 400  # Bad Request

        # Extract and validate meter readings
        try:
            start_meter = Decimal(completion_data['start_meter_reading'])
            end_meter = Decimal(completion_data['end_meter_reading'])
            if end_meter < start_meter:
                return None, "End meter reading cannot be less than start meter reading.", 400  # Bad Request
            # Add checks for negative values if necessary
            if start_meter < 0 or end_meter < 0:
                return None, "Meter readings cannot be negative.", 400
        except (KeyError, ValueError, TypeError):
            return None, "Invalid or missing meter reading values.", 400

        lst_notes = completion_data.get('lst_notes')  # Optional notes

        # Calculate gallons dispensed
        gallons_dispensed = end_meter - start_meter

        # Update order fields
        order.start_meter_reading = start_meter
        order.end_meter_reading = end_meter
        order.calculated_gallons_dispensed = gallons_dispensed
        order.lst_notes = lst_notes  # Update notes (will be None if not provided)
        order.status = FuelOrderStatus.COMPLETED  # Set status to Completed
        order.completion_timestamp = datetime.utcnow()  # Record completion time

        try:
            db.session.commit()
            return order, "Fuel order completed successfully.", 200  # OK
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error completing fuel order: {str(e)}")
            return None, f"Database error while completing order: {str(e)}", 500  # Internal Server Error

    @classmethod
    def review_fuel_order(
        cls,
        order_id: int,
        reviewer_user: User
    ) -> Tuple[Optional[FuelOrder], str, int]:
        """
        Review a completed fuel order.
        
        Args:
            order_id (int): The ID of the order to review
            reviewer_user (User): The authenticated CSR or Admin user performing the review
            
        Returns:
            Tuple[Optional[FuelOrder], str, int]: A tuple containing:
                - The updated FuelOrder if successful, None if failed
                - A success/error message
                - HTTP status code (200, 400, 404)
        """
        # Fetch the fuel order by ID
        order = FuelOrder.query.get(order_id)
        if not order:
            return None, f"Fuel order with ID {order_id} not found.", 404  # Not Found

        # Perform Status Check: Ensure the order is 'COMPLETED' before it can be reviewed
        if order.status != FuelOrderStatus.COMPLETED:
            return None, f"Order cannot be reviewed. Current status is '{order.status.value}', must be 'Completed'.", 400  # Bad Request

        # Update order fields with review information
        order.status = FuelOrderStatus.REVIEWED
        order.reviewed_by_csr_user_id = reviewer_user.id
        order.reviewed_timestamp = datetime.utcnow()

        try:
            db.session.commit()
            return order, "Fuel order marked as reviewed.", 200  # OK
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error reviewing fuel order: {str(e)}")
            return None, f"Database error while marking order as reviewed: {str(e)}", 500  # Internal Server Error

    @classmethod
    def export_fuel_orders_to_csv(
        cls,
        current_user: User,
        filters: Optional[Dict[str, Any]] = None
    ) -> Tuple[Optional[str], str, int]:
        """
        Fetch fuel orders for CSV export based on filters and format them into a CSV string.
        
        Args:
            current_user (User): The authenticated user requesting the export
            filters (Optional[Dict[str, Any]]): Optional dictionary containing filter parameters
                - status (str): Override default REVIEWED status filter
                - date_from (str): Filter orders from this date (TODO)
                - date_to (str): Filter orders until this date (TODO)
                
        Returns:
            Tuple[Optional[str], str, int]: A tuple containing:
                - CSV data string if successful, None if failed
                - A success/error message
                - HTTP status code (200, 400, 500)
        """
        # Authorization check: Only CSR and Admin can export
        if current_user.role not in [UserRole.CSR, UserRole.ADMIN]:
            return None, "Forbidden: Only CSR and Admin users can export fuel orders.", 403

        # Initialize base query
        query = FuelOrder.query

        # Apply default status filter (REVIEWED) or override from filters
        target_status = FuelOrderStatus.REVIEWED  # Default export status
        if filters and filters.get('status'):
            try:
                # Allow overriding default status via filter
                target_status = FuelOrderStatus[filters['status'].upper()]
            except KeyError:
                return None, f"Invalid status value provided for export: {filters['status']}", 400

        query = query.filter(FuelOrder.status == target_status)

        try:
            # Fetch all orders matching the criteria, ordered by review timestamp
            orders_to_export = query.order_by(FuelOrder.reviewed_timestamp.desc()).all()

            if not orders_to_export:
                return [], "No orders found matching the criteria for export.", 200

            # Create in-memory text stream for CSV writing
            output = io.StringIO()
            writer = csv.writer(output)

            # Define and write the header row
            header = [
                'Order ID', 'Status', 'Tail Number', 'Customer ID',
                'Fuel Type', 'Additive Requested', 'Requested Amount',
                'Assigned LST ID', 'Assigned Truck ID',
                'Location on Ramp', 'CSR Notes',
                'Start Meter', 'End Meter', 'Gallons Dispensed', 'LST Notes',
                'Created At (UTC)', 'Dispatch Timestamp (UTC)', 'Acknowledge Timestamp (UTC)',
                'En Route Timestamp (UTC)', 'Fueling Start Timestamp (UTC)',
                'Completion Timestamp (UTC)', 'Reviewed Timestamp (UTC)', 'Reviewed By CSR ID'
            ]
            writer.writerow(header)

            # Helper function to format values safely
            def format_value(value):
                if value is None:
                    return ''
                if isinstance(value, datetime):
                    return value.strftime('%Y-%m-%d %H:%M:%S')  # Consistent UTC format
                if isinstance(value, Decimal):
                    return str(value)  # Convert Decimal to string
                if isinstance(value, bool):
                    return 'Yes' if value else 'No'
                if isinstance(value, FuelOrderStatus):
                    return value.value  # Get enum string value
                return str(value)

            # Write each order as a row in the CSV
            for order in orders_to_export:
                row = [
                    order.id,
                    format_value(order.status),
                    order.tail_number,
                    format_value(order.customer_id),
                    order.fuel_type,
                    format_value(order.additive_requested),
                    format_value(order.requested_amount),
                    format_value(order.assigned_lst_user_id),
                    format_value(order.assigned_truck_id),
                    order.location_on_ramp or '',  # Use empty string for None strings
                    order.csr_notes or '',
                    format_value(order.start_meter_reading),
                    format_value(order.end_meter_reading),
                    format_value(order.calculated_gallons_dispensed),
                    order.lst_notes or '',
                    format_value(order.created_at),
                    format_value(order.dispatch_timestamp),
                    format_value(order.acknowledge_timestamp),
                    format_value(order.en_route_timestamp),
                    format_value(order.fueling_start_timestamp),
                    format_value(order.completion_timestamp),
                    format_value(order.reviewed_timestamp),
                    format_value(order.reviewed_by_csr_user_id)
                ]
                writer.writerow(row)

            # Get the CSV string and close the stream
            csv_data = output.getvalue()
            output.close()

            return csv_data, "CSV data generated successfully.", 200

        except Exception as e:
            current_app.logger.error(f"Error generating CSV export: {str(e)}")
            return None, f"Error generating CSV export: {str(e)}", 500 