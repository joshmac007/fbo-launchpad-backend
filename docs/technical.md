# Technical Documentation

## Recent Debugging Summary (YYYY-MM-DD) - Fuel Order & Aircraft Creation

This section outlines a series of issues encountered and resolved related to fuel order and aircraft creation functionalities, spanning both frontend and backend components.

### 1. Frontend: `TypeError` in `AircraftForm.jsx`
*   **Symptom:** `TypeError: Cannot read properties of null (reading 'tail_number')` when attempting to open the form to create a new aircraft.
*   **Cause:** The `AircraftForm` component received an `initialData` prop as `null` when in "create" mode. The component's default prop assignment (`initialData = {}`) was bypassed for explicit `null` values. Subsequent access to `initialData.tail_number` resulted in the error.
*   **Resolution:** Modified `AircraftForm.jsx` to ensure `initialData` is always treated as an object internally, even if passed as `null` or `undefined`.
    ```javascript
    // Example of fix in AircraftForm.jsx
    const currentInitialData = initialData || {};
    // ... then use currentInitialData for state initialization and effects.
    ```

### 2. Backend & Frontend: Fuel Order Creation Issues (`POST /api/fuel-orders`)

#### a. Initial `400 BAD REQUEST`
*   **Symptom:** Frontend requests to create fuel orders failed with a 400 status.
*   **Cause (Frontend - `OrderCreatePage.jsx`):**
    *   Incorrect data types: `requested_amount` was sent as a string instead of a float. `customer_id` was sent as a string instead of a number (or null).
    *   Logic for `assigned_truck_id`: When "autoAssign" (for LST) was enabled, `assigned_truck_id` was being set to `null`. However, the backend `/api/fuel-orders` endpoint requires `assigned_truck_id` as an integer and has no logic for auto-assigning trucks.
*   **Resolution (Frontend - `OrderCreatePage.jsx`):**
    *   Ensured `requested_amount` is parsed using `parseFloat()`.
    *   Ensured `customer_id` is parsed using `Number()` or set to `null`.
    *   Ensured `assigned_lst_user_id` and `assigned_truck_id` are parsed to integers (or `null` if appropriate for non-auto-assign cases).
    *   Added client-side validation to catch `null` values for required numeric/ID fields before API submission.
*   **Persistent Issue:** A logical discrepancy remains. If "autoAssign" only refers to LST, the UI should still allow/require truck selection. If "autoAssign" should cover trucks, the backend needs corresponding logic, or the frontend needs to send a default/selected truck ID.

#### b. `500 Internal Server Error` - Foreign Key Violation (Revealed by `curl`)
*   **Symptom:** After frontend payload corrections, direct API testing with `curl` (using a seemingly valid payload) resulted in a 500-series error.
*   **Cause (Backend - Database):** `psycopg2.errors.ForeignKeyViolation` on `fuel_orders_tail_number_fkey`. The `tail_number` provided in the fuel order payload (e.g., "N12345") did not exist as a record in the `aircraft` table.
*   **Resolution Path:** The aircraft (e.g., "N12345") must be created in the `aircraft` table *before* a fuel order can be referencing it.
*   **Actual Resolution (Implemented 2025-05-07):** The `FuelOrderService.create_fuel_order` method was modified to automatically create an `Aircraft` record if the provided `tail_number` does not exist. Placeholder values ("UNKNOWN_TYPE" for `aircraft_type`, "UNKNOWN_FUEL" for `fuel_type`) are used for the auto-created aircraft. This prevents the `ForeignKeyViolation` for this specific scenario.

### 3. Backend: Aircraft Creation `500 INTERNAL SERVER ERROR` (`POST /api/admin/aircraft`)
*   **Symptom:** Attempting to create the prerequisite aircraft (e.g., "N12345") via the UI failed with a 500 error. Console logs showed: `Error creating aircraft: 'customer_id' is an invalid keyword argument for Aircraft`.
*   **Cause (Backend - `AircraftService.py` & `Aircraft` Model):**
    *   The frontend `AircraftForm.jsx` was sending `customer_id` as part of the aircraft creation payload.
    *   The `AircraftService.create_aircraft` method was attempting to pass this `customer_id` to the `Aircraft` model constructor.
    *   The `Aircraft` model (`src/models/aircraft.py`) does not have a `customer_id` field.
    *   Additionally, the `Aircraft` model requires `fuel_type`, which was not being explicitly passed by the service to the model constructor in the identified version of the code.
*   **Resolution (Backend - `AircraftService.py`):**
    *   Modified `AircraftService.create_aircraft` to:
        *   No longer pass `customer_id` to the `Aircraft()` constructor.
        *   Explicitly require and pass `tail_number`, `aircraft_type`, and `fuel_type` to the `Aircraft()` constructor, aligning with the model's definition.
    ```python
    # Corrected instantiation in AircraftService.create_aircraft
    # aircraft = Aircraft(
    #     tail_number=data['tail_number'],
    #     aircraft_type=data['aircraft_type'],
    #     fuel_type=data['fuel_type']
    # )
    ```

### 4. General: `net::ERR_FAILED`
*   **Symptom:** Generic network error observed in the browser at various stages.
*   **Potential Causes (Ongoing Investigation):**
    *   Backend server not running or inaccessible.
    *   CORS misconfiguration (though `curl` tests sometimes bypass browser-specific CORS issues).
    *   Frontend error handling: The frontend might not be gracefully handling HTTP 500 errors from the backend, leading to a generic network failure message.
*   **Mitigation:** `curl` tests helped isolate backend API behavior from frontend/browser issues. Further investigation on specific failing frontend requests (Network tab in dev tools) is needed if this persists after backend fixes.

### Key Takeaways & Pending Actions:
*   **Data Integrity:** Ensure referenced entities (like Aircraft for Fuel Orders) exist before attempting to create dependent records. Consider UI enhancements (e.g., searchable dropdowns for existing aircraft) to guide users.
*   **Payload Alignment:** Frontend payloads must strictly match backend expectations (field names, data types). Schema validation on the backend (e.g., using Marshmallow schemas more consistently for request body validation before service layer) can catch mismatches early.
*   **Auto-Assignment Logic:** The "autoAssign" feature for fuel orders needs clear definition:
    *   Does it cover only LST, or LST and Truck?
    *   If Truck is included, backend logic for auto-assigning trucks is needed. (Implemented 2025-05-08 in `fuel_order_routes.py`)
    *   If Truck is not included, frontend UI should not hide truck selection when auto-assign for LST is active.
*   **Customer-Aircraft Relationship:** The current `Aircraft` model does not have a direct `customer_id` link. If this is a desired relationship, the database schema and `Aircraft` model need to be updated. The `AircraftForm.jsx` includes a `customer_id` field, which is currently ignored by the (updated) backend service for aircraft creation. 

### 5. Backend: Fuel Order Route Update (2025-05-08) - Truck Auto-Assignment & Robust Validation
*   **Context:** User reported errors "Truck Assignment invalid/missing", "LST and Truck must be assigned", and "Requested Amount must be a valid number" when using auto-assign for LST and Fuel Truck in fuel order creation.
*   **Changes in `fbo-launchpad-backend/src/routes/fuel_order_routes.py` (`create_fuel_order` function):**
    *   **Truck Auto-Assignment:**
        *   Introduced `AUTO_ASSIGN_TRUCK_ID = -1`.
        *   If `assigned_truck_id` is received as `-1`, the route now attempts to assign the first available active `FuelTruck`.
        *   If no active truck is found, a `400 Bad Request` error is returned.
        *   Validation for `assigned_truck_id` field now explicitly allows `-1`.
    *   **`requested_amount` Validation:**
        *   Validation logic was made more robust.
        *   It now explicitly attempts to convert the incoming value to a `float`.
        *   It checks if the `requested_amount` is positive (greater than 0).
        *   Returns specific `400 Bad Request` errors for missing, non-numeric, or non-positive values.
    *   **General Validation:**
        *   Validation for `assigned_lst_user_id` also updated to explicitly allow `AUTO_ASSIGN_LST_ID` and check for positive IDs otherwise.
        *   String fields in `base_required_fields` are checked to ensure they are not empty/whitespace.
*   **Impact:** Addresses the reported errors by enabling backend support for truck auto-assignment and improving input validation for critical fields. 