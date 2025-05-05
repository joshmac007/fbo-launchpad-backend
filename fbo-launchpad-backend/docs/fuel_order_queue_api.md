# Fuel Order Queue API Documentation

## Overview
Implements endpoints for the LST queue system, allowing LSTs to view and claim unassigned fuel orders.

## Endpoints

### 1. `GET /api/orders/unassigned`
- **Auth:** JWT required (LST role recommended)
- **Returns:** List of all unassigned fuel orders (where `assigned_lst_user_id` is null), ordered by `created_at` ascending.
- **Response Example:**
```json
{
  "orders": [
    {
      "id": 123,
      "tail_number": "N12345",
      "requested_amount": 250.0,
      "location_on_ramp": "Ramp A",
      "created_at": "2025-04-26T01:00:00Z",
      "fuel_type": "Jet A",
      "csr_notes": "Priority customer",
      "status": "Dispatched"
    },
    ...
  ]
}
```

### 2. `POST /api/orders/<order_id>/accept`
- **Auth:** JWT required (LST role enforced)
- **Purpose:** Allows an LST to claim an unassigned order. Only works if order is unassigned; atomic operation.
- **Request Body:** _None_
- **Response Example:**
```json
{
  "success": true,
  "order_id": 123,
  "assigned_lst_user_id": 42
}
```
- **Failure Responses:**
  - `403 Unauthorized` if not LST
  - `404 Not found` if order does not exist
  - `409 Conflict` if order already assigned

## Logic
- Orders are considered unassigned if `assigned_lst_user_id` is null.
- LSTs see a queue of all such orders and can claim one by sending a POST to `/accept`.
- On claim, the order is atomically assigned to the LST and status is updated to `ACKNOWLEDGED`.

## Related Files
- `src/routes/fuel_order_queue_routes.py`
- `src/models/fuel_order.py`

---

## Change History
- 2025-04-26: Initial implementation for LST queue system.
