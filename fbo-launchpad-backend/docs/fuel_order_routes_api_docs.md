# Fuel Order Routes API Documentation

## Overview
This documentation covers the API endpoints implemented in `src/routes/fuel_order_routes.py` for handling fuel order operations in the backend. It includes route details, authentication, and special logic such as auto-assigning LST users.

---

## Endpoints

### 1. `GET /fuel-orders/stats/status-counts`
- **Purpose:** Get counts of fuel orders by status groups (Pending, In Progress, Completed).
- **Auth:** Requires CSR, ADMIN, or LST role (JWT-protected).
- **Responses:**
  - 200: Success, returns status counts.
  - 401/403/500: Error cases with descriptive messages.

### 2. `POST /fuel-orders/`
- **Purpose:** Create a new fuel order.
- **Auth:** Requires CSR, ADMIN, or LST role (JWT-protected).
- **Request Body:**
  - Required: `tail_number`, `fuel_type`, `assigned_lst_user_id`, `assigned_truck_id`, `requested_amount`, `location_on_ramp`
  - Optional: `customer_id`, `additive_requested`, `csr_notes`
- **Special Logic:**
  - If `assigned_lst_user_id` is set to `-1`, the backend will automatically select and assign the least busy active LST user using the following logic:
    - Queries all active LST users.
    - Counts their active/in-progress orders (`DISPATCHED`, `ACKNOWLEDGED`, `EN_ROUTE`, `FUELING`).
    - Assigns the LST with the fewest such orders.
    - Logs the auto-assignment for traceability.
  - If no LST is available, returns an error.
- **Responses:**
  - 201: Success, returns created fuel order.
  - 400/500: Error cases with descriptive messages.

---

## Special Constants
- `AUTO_ASSIGN_LST_ID = -1`: If this value is provided in the payload as `assigned_lst_user_id`, the backend will auto-select the least busy LST.

---

## Security
- All endpoints require JWT authentication.
- Role-based access enforced via decorators.

---

## Logging
- Each major step in the fuel order creation process is logged for debugging and auditing.
- Auto-assignment actions are specifically logged (assigned user and order count).

---

## Usage Notes
- The frontend should send `assigned_lst_user_id: -1` to enable backend auto-assignment of LST.
- All other validation and assignment logic remains unchanged.

---

# End of Documentation
