from flask import Blueprint, request, jsonify, g, Response
from decimal import Decimal
from datetime import datetime
from ..utils.decorators import token_required, require_role
from ..models.user import UserRole
from ..services.fuel_order_service import FuelOrderService
from ..models.fuel_order import FuelOrderStatus

# Create the blueprint for fuel order routes
fuel_order_bp = Blueprint('fuel_order_bp', __name__, url_prefix='/api/fuel-orders')

@fuel_order_bp.route('/', methods=['POST'])
@token_required
@require_role(UserRole.CSR, UserRole.ADMIN)
def create_fuel_order():
    """
    Create a new fuel order.
    Required fields: tail_number, fuel_type, assigned_lst_user_id, assigned_truck_id
    Optional fields: customer_id, additive_requested, requested_amount, location_on_ramp, csr_notes
    """
    data = request.get_json()
    
    # Check if data exists and is a dictionary
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400
    
    # Required fields validation
    required_fields = {
        'tail_number': str,
        'fuel_type': str,
        'assigned_lst_user_id': int,
        'assigned_truck_id': int
    }
    
    for field, field_type in required_fields.items():
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
        try:
            # Convert to expected type if necessary
            if field_type == int:
                data[field] = int(data[field])
            elif field_type == str and not isinstance(data[field], str):
                data[field] = str(data[field])
            
            # Additional validation for specific fields
            if field_type == str and not data[field].strip():
                return jsonify({"error": f"Field {field} cannot be empty"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": f"Invalid type for field {field}. Expected {field_type.__name__}"}), 400
    
    # Optional fields validation
    optional_fields = {
        'customer_id': int,
        'additive_requested': bool,
        'requested_amount': float,
        'location_on_ramp': str,
        'csr_notes': str
    }
    
    for field, field_type in optional_fields.items():
        if field in data:
            try:
                # Convert to expected type if necessary
                if field_type == int:
                    data[field] = int(data[field])
                elif field_type == float:
                    data[field] = float(data[field])
                elif field_type == bool and not isinstance(data[field], bool):
                    data[field] = bool(data[field])
                elif field_type == str and not isinstance(data[field], str):
                    data[field] = str(data[field])
            except (ValueError, TypeError):
                return jsonify({"error": f"Invalid type for field {field}. Expected {field_type.__name__}"}), 400
    
    # TODO: Call FuelOrderService.create_fuel_order(data)
    
    # Temporary success response
    return jsonify({
        "message": "Fuel order creation endpoint called",
        "data": data
    }), 201

@fuel_order_bp.route('/', methods=['GET'])
@token_required
def get_fuel_orders():
    """
    Retrieve a list of fuel orders.
    Supports filtering based on query parameters.
    Accessible by both CSRs (all orders) and LSTs (their assigned orders).
    
    Query Parameters:
        status (str, optional): Filter by order status
        page (int, optional): Page number, defaults to 1
        per_page (int, optional): Items per page, defaults to 20 (max 100)
    """
    # Extract and validate filter/pagination parameters
    filters = {
        'status': request.args.get('status', None, type=str),
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
        # Add other potential filters here later (e.g., date_from, date_to, tail_number)
    }

    # Basic validation/sanitization
    if filters['page'] < 1: filters['page'] = 1
    if filters['per_page'] < 1: filters['per_page'] = 1
    if filters['per_page'] > 100: filters['per_page'] = 100  # Match service limit

    # Call service method with current user and filters
    paginated_result, message = FuelOrderService.get_fuel_orders(
        current_user=g.current_user,
        filters=filters
    )

    # Handle the result
    if paginated_result is not None:
        # Serialize the orders
        orders_list = []
        for order in paginated_result.items:
            orders_list.append({
                "id": order.id,
                "status": order.status.value,
                "tail_number": order.tail_number,
                "customer_id": order.customer_id,
                "fuel_type": order.fuel_type,
                "additive_requested": order.additive_requested,
                "requested_amount": str(order.requested_amount) if order.requested_amount else None,
                "assigned_lst_user_id": order.assigned_lst_user_id,
                "assigned_truck_id": order.assigned_truck_id,
                "location_on_ramp": order.location_on_ramp,
                "start_meter_reading": str(order.start_meter_reading) if order.start_meter_reading else None,
                "end_meter_reading": str(order.end_meter_reading) if order.end_meter_reading else None,
                "calculated_gallons_dispensed": str(order.calculated_gallons_dispensed) if order.calculated_gallons_dispensed else None,
                "created_at": order.created_at.isoformat(),
                "dispatch_timestamp": order.dispatch_timestamp.isoformat() if order.dispatch_timestamp else None,
                "acknowledge_timestamp": order.acknowledge_timestamp.isoformat() if order.acknowledge_timestamp else None,
                "en_route_timestamp": order.en_route_timestamp.isoformat() if order.en_route_timestamp else None,
                "fueling_start_timestamp": order.fueling_start_timestamp.isoformat() if order.fueling_start_timestamp else None,
                "completion_timestamp": order.completion_timestamp.isoformat() if order.completion_timestamp else None,
                "reviewed_timestamp": order.reviewed_timestamp.isoformat() if order.reviewed_timestamp else None,
                "reviewed_by_csr_user_id": order.reviewed_by_csr_user_id
            })

        # Construct response with orders and pagination metadata
        response = {
            "message": message,
            "fuel_orders": orders_list,
            "pagination": {
                "page": paginated_result.page,
                "per_page": paginated_result.per_page,
                "total_pages": paginated_result.pages,
                "total_items": paginated_result.total,
                "has_next": paginated_result.has_next,
                "has_prev": paginated_result.has_prev
            }
        }
        return jsonify(response), 200
    else:
        # Handle error cases
        status_code = 500 if "Database error" in message else (403 if "Forbidden" in message else 400)
        return jsonify({"error": message}), status_code 

@fuel_order_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_fuel_order(order_id):
    """
    Retrieve a single fuel order by its ID.
    Accessible by both CSRs (all orders) and LSTs (their assigned orders).
    Authorization will be handled in the service layer.
    """
    # Call service method to get the fuel order
    order, message, status_code = FuelOrderService.get_fuel_order_by_id(
        order_id=order_id,
        current_user=g.current_user
    )

    # Handle the result based on whether the order was found
    if order is not None:
        # Serialize the full order details
        order_details = {
            "id": order.id,
            "status": order.status.value,
            "tail_number": order.tail_number,
            "customer_id": order.customer_id,  # Consider joining/fetching customer name later
            "fuel_type": order.fuel_type,
            "additive_requested": order.additive_requested,
            "requested_amount": str(order.requested_amount) if order.requested_amount else None,
            "assigned_lst_user_id": order.assigned_lst_user_id,  # Consider joining/fetching LST name later
            "assigned_truck_id": order.assigned_truck_id,  # Consider joining/fetching truck name later
            "location_on_ramp": order.location_on_ramp,
            "csr_notes": order.csr_notes,
            "start_meter_reading": str(order.start_meter_reading) if order.start_meter_reading else None,
            "end_meter_reading": str(order.end_meter_reading) if order.end_meter_reading else None,
            "calculated_gallons_dispensed": str(order.calculated_gallons_dispensed) if order.calculated_gallons_dispensed else None,
            "lst_notes": order.lst_notes,
            "created_at": order.created_at.isoformat(),
            "dispatch_timestamp": order.dispatch_timestamp.isoformat() if order.dispatch_timestamp else None,
            "acknowledge_timestamp": order.acknowledge_timestamp.isoformat() if order.acknowledge_timestamp else None,
            "en_route_timestamp": order.en_route_timestamp.isoformat() if order.en_route_timestamp else None,
            "fueling_start_timestamp": order.fueling_start_timestamp.isoformat() if order.fueling_start_timestamp else None,
            "completion_timestamp": order.completion_timestamp.isoformat() if order.completion_timestamp else None,
            "reviewed_timestamp": order.reviewed_timestamp.isoformat() if order.reviewed_timestamp else None,
            "reviewed_by_csr_user_id": order.reviewed_by_csr_user_id  # Consider joining/fetching CSR name later
        }
        return jsonify({"message": message, "fuel_order": order_details}), status_code
    else:
        # Return error message and status code from service
        return jsonify({"error": message}), status_code

@fuel_order_bp.route('/<int:order_id>/status', methods=['PATCH'])
@token_required
def update_fuel_order_status(order_id):
    """
    Update the status of a specific fuel order.
    Required field in request body: status (string)
    """
    # Get and validate request data
    data = request.get_json()
    
    # Validate request data exists and has status field
    if not data or 'status' not in data:
        return jsonify({"error": "Missing 'status' field in request body"}), 400
    
    new_status_str = data['status']
    
    # Validate the provided status string against the FuelOrderStatus enum
    try:
        new_status_enum = FuelOrderStatus[new_status_str.upper()]
    except KeyError:
        valid_statuses = [s.name for s in FuelOrderStatus]
        return jsonify({"error": f"Invalid status value '{new_status_str}'. Valid statuses are: {valid_statuses}"}), 400
    
    # Call service method to update the order status
    updated_order, message, status_code = FuelOrderService.update_order_status(
        order_id=order_id,
        new_status=new_status_enum,
        current_user=g.current_user
    )
    
    # Handle the result from the service
    if updated_order is not None:
        # Serialize the updated order details for the response
        order_details = {
            "id": updated_order.id,
            "status": updated_order.status.value,
            "acknowledge_timestamp": updated_order.acknowledge_timestamp.isoformat() if updated_order.acknowledge_timestamp else None,
            "en_route_timestamp": updated_order.en_route_timestamp.isoformat() if updated_order.en_route_timestamp else None,
            "fueling_start_timestamp": updated_order.fueling_start_timestamp.isoformat() if updated_order.fueling_start_timestamp else None,
            "completion_timestamp": updated_order.completion_timestamp.isoformat() if updated_order.completion_timestamp else None,
            "reviewed_timestamp": updated_order.reviewed_timestamp.isoformat() if updated_order.reviewed_timestamp else None
        }
        return jsonify({"message": message, "fuel_order": order_details}), status_code
    else:
        return jsonify({"error": message}), status_code 

@fuel_order_bp.route('/<int:order_id>/complete', methods=['POST'])
@token_required
def submit_fuel_data(order_id):
    """
    Submit completed fuel data for a specific fuel order.
    Required fields: start_meter_reading, end_meter_reading
    Optional fields: lst_notes
    """
    data = request.get_json()
    
    # Check if data exists
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    # Check required fields
    if 'start_meter_reading' not in data or 'end_meter_reading' not in data:
        return jsonify({"error": "Missing required fields: 'start_meter_reading' and 'end_meter_reading'"}), 400

    # Basic type check for meter readings
    try:
        # Attempt conversion to ensure they are number-like, service does Decimal conversion
        float(data['start_meter_reading'])
        float(data['end_meter_reading'])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid number format for meter readings"}), 400

    # Prepare completion data
    completion_data = {
        'start_meter_reading': data['start_meter_reading'],  # Pass as string/number, service converts to Decimal
        'end_meter_reading': data['end_meter_reading'],
        'lst_notes': data.get('lst_notes')  # Optional notes
    }

    # Call service method to complete the order
    completed_order, message, status_code = FuelOrderService.complete_fuel_order(
        order_id=order_id,
        completion_data=completion_data,
        current_user=g.current_user  # g.current_user is set by @token_required
    )

    # Handle the result from the service
    if completed_order is not None:
        # Serialize the completed order details for the response
        order_details = {
            "id": completed_order.id,
            "status": completed_order.status.value,  # Should be COMPLETED
            "start_meter_reading": str(completed_order.start_meter_reading) if completed_order.start_meter_reading else None,
            "end_meter_reading": str(completed_order.end_meter_reading) if completed_order.end_meter_reading else None,
            "calculated_gallons_dispensed": str(completed_order.calculated_gallons_dispensed) if completed_order.calculated_gallons_dispensed else None,
            "lst_notes": completed_order.lst_notes,
            "completion_timestamp": completed_order.completion_timestamp.isoformat() if completed_order.completion_timestamp else None
        }
        return jsonify({"message": message, "fuel_order": order_details}), status_code  # Use status_code from service (should be 200)
    else:
        return jsonify({"error": message}), status_code  # Use status_code from service (e.g., 400, 403, 404, 500) 

@fuel_order_bp.route('/<int:order_id>/review', methods=['PATCH'])
@token_required
@require_role(UserRole.CSR, UserRole.ADMIN)
def review_fuel_order(order_id):
    """
    Mark a fuel order as reviewed by a CSR or Admin.
    This endpoint is only accessible to CSRs and Admins.
    No request body is required as the action of calling this endpoint indicates review.
    """
    # Call service method to review the order
    reviewed_order, message, status_code = FuelOrderService.review_fuel_order(
        order_id=order_id,
        reviewer_user=g.current_user
    )
    
    # Handle the result from the service
    if reviewed_order is not None:
        # Serialize the reviewed order details for the response
        order_details = {
            "id": reviewed_order.id,
            "status": reviewed_order.status.value,  # Should be REVIEWED
            "reviewed_by_csr_user_id": reviewed_order.reviewed_by_csr_user_id,
            "reviewed_timestamp": reviewed_order.reviewed_timestamp.isoformat() if reviewed_order.reviewed_timestamp else None
        }
        return jsonify({"message": message, "fuel_order": order_details}), status_code  # Use status_code from service (should be 200)
    else:
        return jsonify({"error": message}), status_code  # Use status_code from service (e.g., 400, 404, 500) 

@fuel_order_bp.route('/export', methods=['GET'])
@token_required
@require_role(UserRole.CSR, UserRole.ADMIN)
def export_fuel_orders_csv():
    """
    Export fuel orders as a CSV file.
    Accessible only by CSRs and Admins.
    
    Query Parameters:
        status (str, optional): Filter by order status (e.g., COMPLETED, REVIEWED)
        date_from (str, optional): Start date for filtering (ISO format) - TODO
        date_to (str, optional): End date for filtering (ISO format) - TODO
    """
    # Extract filter parameters from request.args
    filters = {
        'status': request.args.get('status', None, type=str)
        # TODO: Add date_from, date_to filters later
    }

    # Call service method to generate CSV data
    csv_data, message, status_code = FuelOrderService.export_fuel_orders_to_csv(
        current_user=g.current_user,
        filters=filters
    )

    # Handle the result from the service
    if csv_data is not None and status_code == 200:
        # Check if we got an empty list (no data found)
        if isinstance(csv_data, list) and len(csv_data) == 0:
            return jsonify({"message": message}), 200

        # Generate dynamic filename with timestamp
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"fuel_orders_export_{timestamp}.csv"

        # Create response with CSV data and appropriate headers
        response = Response(
            csv_data,
            mimetype='text/csv',
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        return response
    else:
        # Return error message and status code from service
        return jsonify({"error": message}), status_code 