# FBO LaunchPad API Documentation

## Authentication

### Login Endpoint
```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response (200 OK):**
```json
{
    "token": "string"  // JWT token for subsequent requests
}
```

**Usage Notes:**
- All subsequent API requests must include the JWT token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Two types of users: CSR (Customer Service Representative) and LST (Line Service Technician)

## Fuel Orders API

### 1. Create Fuel Order
```
POST /fuel-orders/
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** CSR users only

**Request Body:**
```json
{
    "tail_number": "string",
    "fuel_type": "string",
    "requested_amount": "number",
    "location_on_ramp": "string",
    "csr_notes": "string",
    "assigned_truck_id": "number",
    "assigned_lst_user_id": "number",
    "additive_requested": "boolean",
    "customer_id": "number"  // optional
}
```

**Response (201 Created):**
```json
{
    "id": "number",
    "tail_number": "string",
    "customer_id": "number",
    "fuel_type": "string",
    "additive_requested": "boolean",
    "requested_amount": "number",
    "assigned_lst_user_id": "number",
    "assigned_truck_id": "number",
    "location_on_ramp": "string",
    "csr_notes": "string",
    "status": "string",  // Initially "Dispatched"
    "created_at": "string"  // ISO format datetime
}
```

### 2. Get Fuel Orders List
```
GET /fuel-orders/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "fuel_orders": [
        {
            "id": "number",
            "status": "string",
            "tail_number": "string",
            "customer_id": "number",
            "fuel_type": "string",
            "additive_requested": "boolean",
            "requested_amount": "string",
            "assigned_lst_user_id": "number",
            "assigned_truck_id": "number",
            "location_on_ramp": "string",
            "start_meter_reading": "string",
            "end_meter_reading": "string",
            "calculated_gallons_dispensed": "string",
            "created_at": "string",
            "dispatch_timestamp": "string",
            "acknowledge_timestamp": "string",
            "en_route_timestamp": "string",
            "fueling_start_timestamp": "string"
        }
    ],
    "pagination": {
        "page": "number",
        "per_page": "number",
        "total_pages": "number",
        "total_items": "number",
        "has_next": "boolean",
        "has_prev": "boolean"
    }
}
```

### 3. Update Fuel Order Status
```
PUT /fuel-orders/{order_id}/
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "status": "string",  // Must be uppercase with underscores
    "assigned_truck_id": "number"
}
```

**Valid Status Values:**
- "DISPATCHED"
- "ACKNOWLEDGED"
- "EN_ROUTE"
- "FUELING"
- "COMPLETED"
- "REVIEWED"
- "CANCELLED"

**Response (200 OK):**
```json
{
    "id": "number",
    "tail_number": "string",
    "customer_id": "number",
    "fuel_type": "string",
    "additive_requested": "boolean",
    "requested_amount": "number",
    "assigned_lst_user_id": "number",
    "assigned_truck_id": "number",
    "location_on_ramp": "string",
    "csr_notes": "string",
    "status": "string",
    "updated_at": "string"
}
```

### 4. Submit Fuel Data (Complete Order)
```
PUT /fuel-orders/{order_id}/submit-data
Authorization: Bearer <token>
Content-Type: application/json
```

**Access:** LST users only

**Request Body:**
```json
{
    "start_meter_reading": "number",
    "end_meter_reading": "number",
    "lst_notes": "string"  // optional
}
```

**Validation Rules:**
- Order must be in "FUELING" status
- `end_meter_reading` must be greater than `start_meter_reading`
- Both meter readings must be non-negative

**Response (200 OK):**
```json
{
    "message": "Fuel data submitted successfully",
    "fuel_order": {
        "id": "number",
        "status": "string",
        "tail_number": "string",
        "start_meter_reading": "string",
        "end_meter_reading": "string",
        "calculated_gallons_dispensed": "string",
        "lst_notes": "string",
        "completion_timestamp": "string"
    }
}
```

## Fuel Order Workflow

1. **Order Creation (CSR)**
   - CSR creates order with initial details
   - Status: DISPATCHED

2. **LST Acknowledgment**
   - LST acknowledges the assigned order
   - Status: ACKNOWLEDGED

3. **En Route**
   - LST indicates they're heading to the aircraft
   - Status: EN_ROUTE

4. **Fueling**
   - LST begins fueling operation
   - Status: FUELING

5. **Completion**
   - LST submits meter readings and notes
   - Must use dedicated `/submit-data` endpoint
   - Status: COMPLETED

6. **Review**
   - CSR reviews the completed order
   - Status: REVIEWED

## Frontend Implementation Guidelines

1. **Authentication Flow**
   - Implement login screen
   - Store JWT token securely
   - Include token in all API requests
   - Handle token expiration

2. **Role-Based UI**
   - Show different views for CSR and LST users
   - CSR: Order creation, review, and overview
   - LST: Order acknowledgment, status updates, and completion

3. **Status Management**
   - Use exact status strings as specified
   - Implement status transition validation
   - Show appropriate action buttons based on current status

4. **Forms**
   - Validate all required fields
   - Format numbers appropriately
   - Handle optional fields
   - Show validation errors

5. **Real-time Updates**
   - Implement polling or WebSocket for order status updates
   - Show status changes in real-time

---

## Users API

### 1. Create User
```
POST /users/
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "name": "string",
    "email": "string",
    "role": "string",  // ADMIN, CSR, LST
    "password": "string"
}
```

**Response (201 Created):**
```json
{
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "is_active": "boolean",
    "created_at": "string"
}
```

### 2. Get User List
```
GET /users/
Authorization: Bearer <token>
```
**Access:** Admin, CSR

**Response (200 OK):**
```json
{
    "users": [
        {
            "id": "number",
            "name": "string",
            "email": "string",
            "role": "string",
            "is_active": "boolean",
            "created_at": "string"
        }
    ]
}
```

### 3. Update User
```
PATCH /users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "name": "string",  // optional
    "email": "string", // optional
    "role": "string",  // optional
    "is_active": "boolean" // optional
}
```

**Response (200 OK):**
```json
{
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "is_active": "boolean",
    "created_at": "string"
}
```

### 4. Delete User
```
DELETE /users/{user_id}
Authorization: Bearer <token>
```
**Access:** Admin only (soft delete)

**Response (200 OK):**
```json
{
    "message": "User deleted"
}
```

---

## Fuel Trucks API

### 1. Create Fuel Truck
```
POST /fuel-trucks/
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "truck_number": "string",
    "fuel_type": "string",
    "capacity": "number",
    "current_meter_reading": "number"  // optional
}
```

**Response (201 Created):**
```json
{
    "id": "number",
    "truck_number": "string",
    "fuel_type": "string",
    "capacity": "number",
    "current_meter_reading": "number",
    "is_active": "boolean"
}
```

### 2. Get Fuel Truck List
```
GET /fuel-trucks/
Authorization: Bearer <token>
```
**Access:** Admin, CSR

**Response (200 OK):**
```json
{
    "fuel_trucks": [
        {
            "id": "number",
            "truck_number": "string",
            "fuel_type": "string",
            "capacity": "number",
            "current_meter_reading": "number",
            "is_active": "boolean"
        }
    ]
}
```

### 3. Update Fuel Truck
```
PATCH /fuel-trucks/{truck_id}
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "truck_number": "string", // optional
    "fuel_type": "string", // optional
    "capacity": "number", // optional
    "current_meter_reading": "number", // optional
    "is_active": "boolean" // optional
}
```

**Response (200 OK):**
```json
{
    "id": "number",
    "truck_number": "string",
    "fuel_type": "string",
    "capacity": "number",
    "current_meter_reading": "number",
    "is_active": "boolean"
}
```

### 4. Delete Fuel Truck
```
DELETE /fuel-trucks/{truck_id}
Authorization: Bearer <token>
```
**Access:** Admin only

**Response (200 OK):**
```json
{
    "message": "Fuel truck deleted"
}
```

---

## Aircraft API

### 1. Create Aircraft
```
POST /aircraft/
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "tail_number": "string",
    "aircraft_type": "string", // optional
    "customer_id": "number" // optional
}
```

**Response (201 Created):**
```json
{
    "tail_number": "string",
    "aircraft_type": "string",
    "customer_id": "number"
}
```

### 2. Get Aircraft List
```
GET /aircraft/
Authorization: Bearer <token>
```
**Access:** Admin, CSR

**Response (200 OK):**
```json
{
    "aircraft": [
        {
            "tail_number": "string",
            "aircraft_type": "string",
            "customer_id": "number"
        }
    ]
}
```

### 3. Update Aircraft
```
PATCH /aircraft/{tail_number}
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "aircraft_type": "string", // optional
    "customer_id": "number" // optional
}
```

**Response (200 OK):**
```json
{
    "tail_number": "string",
    "aircraft_type": "string",
    "customer_id": "number"
}
```

### 4. Delete Aircraft
```
DELETE /aircraft/{tail_number}
Authorization: Bearer <token>
```
**Access:** Admin only

**Response (200 OK):**
```json
{
    "message": "Aircraft deleted"
}
```

---

## Customers API

### 1. Create Customer
```
POST /customers/
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "name": "string"
}
```

**Response (201 Created):**
```json
{
    "id": "number",
    "name": "string"
}
```

### 2. Get Customer List
```
GET /customers/
Authorization: Bearer <token>
```
**Access:** Admin, CSR

**Response (200 OK):**
```json
{
    "customers": [
        {
            "id": "number",
            "name": "string"
        }
    ]
}
```

### 3. Update Customer
```
PATCH /customers/{customer_id}
Authorization: Bearer <token>
Content-Type: application/json
```
**Access:** Admin only

**Request Body:**
```json
{
    "name": "string" // optional
}
```

**Response (200 OK):**
```json
{
    "id": "number",
    "name": "string"
}
```

### 4. Delete Customer
```
DELETE /customers/{customer_id}
Authorization: Bearer <token>
```
**Access:** Admin only

**Response (200 OK):**
```json
{
    "message": "Customer deleted"
}
```

---

### Inconsistencies/Required Changes
- All endpoint prefixes should be plural (e.g., `/users/`, `/fuel-trucks/`, `/aircraft/`, `/customers/`).
- Consistent use of snake_case for field names in backend, but some older docs and possibly frontend code use camelCase. **Frontend and docs should be updated to snake_case everywhere.**
- All numeric fields are returned as numbers, not strings, in real API responses.
- Status values for fuel orders must be uppercase with underscores (e.g., `DISPATCHED`).
- All timestamps are ISO 8601 strings.
- All CRUD endpoints require JWT in Authorization header.
- All create/update endpoints use POST/PATCH with JSON bodies.
- Fuel truck and aircraft uniqueness is enforced by `truck_number` and `tail_number` respectively.
- User deletion is soft (deactivation), but API returns a generic "deleted" message.

#### Additional File Changes Needed
- **Frontend code** (especially API calls, data models, and UI components) should be reviewed and updated to use snake_case for all fields to match backend and OpenAPI documentation.
- **Documentation** (including API docs and example payloads) should be standardized to snake_case for consistency and clarity.
   - Update order list when status changes

6. **Error Handling**
   - Handle all HTTP status codes
   - Show appropriate error messages
   - Implement retry logic where appropriate

