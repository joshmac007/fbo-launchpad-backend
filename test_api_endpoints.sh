#!/bin/bash

# ===========================
# API Endpoint Test Script
# ===========================
# This script tests CORS preflight (OPTIONS) and basic GET/POST functionality
# for major API collection endpoints.
#
# Set your JWT token and origin below before running.
# ===========================

# --- USER CONFIGURATION ---
# Set your JWT token here (obtain via /api/auth/login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NjU2MTIwMCwianRpIjoiOWEwN2I5NzItOTQzZi00YTQxLWI2N2UtZGE5NTViMGM3Y2I2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NDY1NjEyMDAsImNzcmYiOiI5MzdhMWFiMy0wZDc1LTRhYWItYmI5Ny1hZjk0ZjlmYmNjNjQiLCJleHAiOjE3NDY1NjQ4MDAsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJTeXN0ZW0gQWRtaW5pc3RyYXRvciJdLCJpc19hY3RpdmUiOnRydWV9.5xgbhJsk4_k-Y3h4SoUS9k3kPwgEKdEOrtazROiuBRA"

# Set the origin to match your frontend (for CORS testing)
ORIGIN="http://localhost:3000"

# Base API URL
BASE_URL="http://localhost:5001"

# Helper function for spacing
function spacer() {
  echo -e "\n========================================\n"
}

# ----------- AUTH REGISTER -----------
spacer
echo "Testing /api/auth/register (POST, OPTIONS)"
curl -i -X OPTIONS "$BASE_URL/api/auth/register" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

# POST (uncomment to test, requires payload_register.json)
# curl -i -X POST "$BASE_URL/api/auth/register/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_register.json
# # Create payload_register.json with valid registration data.

# ----------- FUEL ORDERS -----------
spacer
echo "Testing /api/fuel-orders (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/fuel-orders" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/fuel-orders/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_fuel_orders.json)
# curl -i -X POST "$BASE_URL/api/fuel-orders/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_fuel_orders.json
# # Create payload_fuel_orders.json with valid order data.

# ----------- FUEL ORDERS STATUS COUNTS -----------
spacer
echo "Testing /api/fuel-orders/stats/status-counts (OPTIONS, GET)"
curl -i -X OPTIONS "$BASE_URL/api/fuel-orders/stats/status-counts" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/fuel-orders/stats/status-counts/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# ----------- FUEL TRUCKS -----------
spacer
echo "Testing /api/fuel-trucks (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/fuel-trucks" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/fuel-trucks/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_fuel_trucks.json)
# curl -i -X POST "$BASE_URL/api/fuel-trucks/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_fuel_trucks.json
# # Create payload_fuel_trucks.json with valid truck data.

# ----------- USERS -----------
spacer
echo "Testing /api/users (OPTIONS, GET)"
curl -i -X OPTIONS "$BASE_URL/api/users" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/users/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# ----------- AIRCRAFT -----------
spacer
echo "Testing /api/aircraft (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/aircraft" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/aircraft/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_aircraft.json)
# curl -i -X POST "$BASE_URL/api/aircraft/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_aircraft.json
# # Create payload_aircraft.json with valid aircraft data.

# ----------- CUSTOMERS -----------
spacer
echo "Testing /api/customers (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/customers" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/customers/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_customers.json)
# curl -i -X POST "$BASE_URL/api/customers/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_customers.json
# # Create payload_customers.json with valid customer data.

# ----------- ADMIN USERS -----------
spacer
echo "Testing /api/admin/users (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/admin/users" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/admin/users/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_admin_users.json)
# curl -i -X POST "$BASE_URL/api/admin/users/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_admin_users.json
# # Create payload_admin_users.json with valid admin user data.

# ----------- ADMIN ROLES -----------
spacer
echo "Testing /api/admin/roles (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/admin/roles" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/admin/roles/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_admin_roles.json)
# curl -i -X POST "$BASE_URL/api/admin/roles/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_admin_roles.json
# # Create payload_admin_roles.json with valid role data.

# ----------- ADMIN PERMISSIONS -----------
spacer
echo "Testing /api/admin/permissions (OPTIONS, GET)"
curl -i -X OPTIONS "$BASE_URL/api/admin/permissions" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/admin/permissions/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# ----------- ADMIN AIRCRAFT -----------
spacer
echo "Testing /api/admin/aircraft (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/admin/aircraft" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/admin/aircraft/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_admin_aircraft.json)
# curl -i -X POST "$BASE_URL/api/admin/aircraft/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_admin_aircraft.json
# # Create payload_admin_aircraft.json with valid aircraft data.

# ----------- ADMIN CUSTOMERS -----------
spacer
echo "Testing /api/admin/customers (OPTIONS, GET, POST)"
curl -i -X OPTIONS "$BASE_URL/api/admin/customers" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

curl -i -X GET "$BASE_URL/api/admin/customers/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: $ORIGIN"

# POST (uncomment to test, requires payload_admin_customers.json)
# curl -i -X POST "$BASE_URL/api/admin/customers/" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Origin: $ORIGIN" \
#   -d @payload_admin_customers.json
# # Create payload_admin_customers.json with valid customer data.

echo -e "\nAll endpoint tests completed."