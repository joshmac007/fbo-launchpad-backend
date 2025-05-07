# Product Requirements Document (PRD)

## 1. Introduction

(Placeholder for project overview, goals, target audience)

## 2. User Stories

(Placeholder for user stories)

## 3. Features

### 3.1 Aircraft Management

*   **Description:** Allows administrators to create, view, update, and delete aircraft records in the system.
*   **Core Attributes:** `tail_number` (unique identifier), `aircraft_type`, `fuel_type`.
*   **Points for Clarification (from YYYY-MM-DD debugging session):**
    *   **Aircraft-Customer Relationship:** How are aircraft associated with customers? 
        *   Is `customer_id` a direct attribute of an aircraft?
        *   Is it an optional piece of information for an aircraft?
        *   Or is the relationship managed elsewhere (e.g., customer owns multiple aircraft, aircraft can be used by multiple customers not directly linked at aircraft entity level)?
        *   The current `Aircraft` database model does not include a `customer_id`. The frontend form for aircraft creation includes a `customer_id` field, which is currently not stored with the aircraft data. This needs to be reconciled with product requirements.

### 3.2 Fuel Order Management

*   **Description:** Allows users (CSRs, LSTs) to create, manage, and track fuel orders.
*   **Key Information for Creation:** Tail number, fuel type, requested amount, location, LST assignment, truck assignment.
    *   **Update (2025-05-07):** If a `tail_number` is provided for which no `Aircraft` record exists, the system will now automatically create a new `Aircraft` record. This auto-created aircraft will use placeholder values: `aircraft_type` will be "UNKNOWN_TYPE" and `fuel_type` will be "UNKNOWN_FUEL". This simplifies the workflow for users, as they no longer need to manually create an aircraft before logging a fuel order for it.
*   **Feature: Auto-Assignment for Fuel Orders**
    *   **Current Implementation:** An "autoAssign" toggle is available on the fuel order creation form (`OrderCreatePage.jsx`). When checked, it successfully triggers auto-assignment of an LST (Line Service Technician) by the backend (`assigned_lst_user_id: -1`).
    *   **Points for Clarification (from YYYY-MM-DD debugging session):**
        1.  **Scope of Auto-Assignment:** Does the "autoAssign" feature intend to cover:
            *   Only LST assignment?
            *   Both LST and Fuel Truck assignment?
        2.  **Truck Assignment when LST is Auto-Assigned:**
            *   The backend currently *requires* a valid `assigned_truck_id` (integer) for all fuel orders and does not have logic to auto-assign a truck.
            *   The frontend UI currently hides the truck selection when "autoAssign" is checked.
            *   **If auto-assign is LST-only:** The frontend UI should not hide truck selection; the user must still manually select a truck.
            *   **If auto-assign should include trucks:** The backend API and service layer need to be enhanced to support truck auto-assignment (e.g., based on availability, fuel compatibility). This might involve accepting a special value for `assigned_truck_id` (like `-1`) or implementing the selection logic in the backend.
        *   Clarifying this behavior is essential for consistent system operation and user experience.

## 4. Design & UX Considerations

(Placeholder for UI mockups, UX flow descriptions)

### Data Integrity & User Input (Observations from YYYY-MM-DD debugging session):
*   **Referencing Existing Entities:** For creating fuel orders, the `tail_number` must refer to an aircraft already in the system. Consider UI enhancements like a searchable dropdown of existing aircraft to prevent errors from typos or attempts to order fuel for non-existent aircraft.
    *   **Update (2025-05-07):** The backend now automatically creates an `Aircraft` record with placeholder details if a `tail_number` is provided that doesn't exist in the database. While this resolves backend errors (`ForeignKeyViolation`), the UI should still ideally guide users. For auto-created aircraft, there should be a clear indication or follow-up process for updating the placeholder `aircraft_type` and `fuel_type` to accurate values at a later stage (e.g., via an admin interface or a notification).

## 5. Future Considerations / Roadmap

(Placeholder for future features, V2 ideas etc.) 