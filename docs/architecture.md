# System Architecture

## Overview

(Placeholder for general system architecture description, diagrams, etc.)

## Key Architectural Decisions & Patterns

(Placeholder for major architectural choices)

## Data Models & Relationships

(Placeholder for detailed data model descriptions - ideally linked to or generated from model definitions)

### Recent Observations & Clarifications (2025-05-07):

*   **`Aircraft` Model:**
    *   Currently defined with `tail_number` (PK), `aircraft_type`, and `fuel_type` as core attributes.
    *   **No Direct `customer_id` Link:** The `Aircraft` model does not have a direct foreign key or attribute for `customer_id`. If an aircraft needs to be associated with a specific customer, this relationship needs to be explicitly defined (e.g., via a linking table, or by adding `customer_id` to the `Aircraft` model and updating services accordingly). The frontend `AircraftForm.jsx` currently includes a `customer_id` field, which is not utilized by the backend for aircraft creation as per the current model.

*   **`FuelOrder` Model:**
    *   **Dependency on `Aircraft`:** Contains a `tail_number` field that is a foreign key to the `aircraft` table (`fuel_orders_tail_number_fkey`). This enforces that an `Aircraft` record with the specified `tail_number` must exist before a `FuelOrder` can be created for it.
    *   **`assigned_truck_id` Requirement:** The backend logic for creating fuel orders (`POST /api/fuel-orders`) requires `assigned_truck_id` as a mandatory integer. There is currently no backend logic to auto-assign a truck if one is not provided, even if `assigned_lst_user_id` is set to `-1` (for LST auto-assignment).

### Recent Observations & Clarifications (2025-05-07 - Aircraft Auto-Creation):

*   **`FuelOrderService.create_fuel_order` Behavior Change:**
    *   The service now automatically creates an `Aircraft` record if the `tail_number` provided in `order_data` does not already exist in the `aircraft` table.
    *   This resolves the previous `ForeignKeyViolation` (on `fuel_orders_tail_number_fkey`) when attempting to create a fuel order for an aircraft not yet in the system.
    *   **Placeholder Values:** Auto-created aircraft use the following placeholders:
        *   `aircraft_type`: "UNKNOWN_TYPE"
        *   `fuel_type`: "UNKNOWN_FUEL"
    *   The new `Aircraft` and the `FuelOrder` are committed to the database in the same transaction.

## Component Interactions & Workflows

(Placeholder for descriptions of how major components interact)

### Fuel Order Creation Workflow - Auto-Assignment Considerations (YYYY-MM-DD):

*   **Current State & Discrepancy (Previously):**
    *   The frontend (`OrderCreatePage.jsx`) provides an "autoAssign" checkbox. When checked, it sends `assigned_lst_user_id: -1` to the backend, which correctly triggers LST auto-assignment.
    *   However, when "autoAssign" is checked, the frontend currently hides the truck selection UI. If no truck is pre-selected or defaulted, the `assigned_truck_id` can be sent as `null` or not at all, which conflicted with the backend's mandatory integer requirement.
*   **Resolution (Implemented YYYY-MM-DD, updated 2025-05-08):**
    *   The backend route for fuel order creation (`POST /api/fuel-orders` in `fuel_order_routes.py`) has been updated.
    *   It now accepts `assigned_truck_id: -1` as a special value to trigger fuel truck auto-assignment.
    *   If `assigned_truck_id: -1` is received, the backend will attempt to assign the first available active fuel truck.
    *   If no active truck is available, a `400 Bad Request` error is returned.
*   **Architectural Clarification (Updated 2025-05-08):**
    1.  **Scope of "Auto-Assign":** The "autoAssign" feature, when toggled by the user to imply auto-assignment for both LST and Truck, is now supported by the backend if the frontend sends `assigned_lst_user_id: -1` and `assigned_truck_id: -1`.
    2.  **Backend Logic:** The backend route now contains logic to auto-assign an LST (if `assigned_lst_user_id: -1`) and a fuel truck (if `assigned_truck_id: -1`).
    3.  **Frontend Consideration:** The frontend (`OrderCreatePage.jsx`) should ensure that if the user intends to auto-assign both LST and truck, it sends `assigned_lst_user_id: -1` and `assigned_truck_id: -1` to the backend. If the "autoAssign" checkbox is meant to cover both, the frontend should send both IDs as -1. If it's meant to be LST-only, then `assigned_truck_id` must be a valid selected truck ID.

    *   This aligns frontend intent with backend capabilities. Further frontend adjustments might be needed to ensure the correct payload is sent based on user selection for auto-assignment.

### Fuel Order Creation Workflow - Aircraft Handling (2025-05-07):

*   **Previous State:** `FuelOrderService.create_fuel_order` would fail with a `ForeignKeyViolation` if the `tail_number` in the payload did not correspond to an existing record in the `aircraft` table.
*   **Current State:** The service first attempts to fetch an `Aircraft` by `tail_number`.
    *   If found, it proceeds to use the existing aircraft.
    *   If not found, it instantiates a new `Aircraft` object with the provided `tail_number` and placeholder values for `aircraft_type` ("UNKNOWN_TYPE") and `fuel_type` ("UNKNOWN_FUEL"). This new aircraft is added to the database session.
    *   The `FuelOrder` is then created, referencing the (either existing or newly created) aircraft's `tail_number`.
    *   Both the new fuel order and the (potentially) new aircraft are committed in a single transaction. This ensures data integrity and simplifies the process for users who might be creating an order for a new aircraft.

## API Design Notes

(Placeholder for API conventions, versioning, etc.)

### Recent API Endpoint Behavior Notes (YYYY-MM-DD):

*   **`POST /api/admin/aircraft` (Aircraft Creation):**
    *   Expects `tail_number`, `aircraft_type`, `fuel_type`.
    *   Does not process `customer_id` as part of the `Aircraft` entity itself. If `customer_id` is sent in the payload, it's ignored by the service layer when constructing the `Aircraft` object.
*   **`POST /api/fuel-orders` (Fuel Order Creation):**
    *   Strictly requires `tail_number` (but if not found in `aircraft` table, an `Aircraft` record will now be auto-created with placeholder details), `fuel_type` (for the order itself), `requested_amount` (float, must be > 0).
    *   `assigned_lst_user_id` (int): Send `-1` for LST auto-assignment. Otherwise, a valid LST user ID is required.
    *   `assigned_truck_id` (int): Send `-1` for fuel truck auto-assignment (backend will pick first available active truck). Otherwise, a valid fuel truck ID is required.
    *   Payloads must match these types and presence requirements to avoid `400 BAD REQUEST` errors.
    *   Validation for `requested_amount` is now more robust, ensuring it's a positive number.
    *   **Side-Effect (Aircraft Auto-Creation - 2025-05-07):** This endpoint may now create a new `Aircraft` record in the database if the provided `tail_number` does not exist. Auto-created aircraft will have `aircraft_type` set to "UNKNOWN_TYPE" and `fuel_type` set to "UNKNOWN_FUEL". Callers should be aware of this potential side-effect.
    *   **Side-Effect (Truck Auto-Assignment - 2025-05-08):** If `assigned_truck_id: -1` is provided, the backend will attempt to assign an available active fuel truck. If none are available, the request will fail. 