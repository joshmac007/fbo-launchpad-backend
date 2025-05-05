# FBO LaunchPad Frontend Integration Guide

## Overview

FBO LaunchPad is a comprehensive Fixed Base Operator (FBO) management system designed to streamline aircraft fueling operations. The backend API provides a robust set of endpoints to support the digital fuel order workflow, focusing on the interaction between Customer Service Representatives (CSRs), Line Service Technicians (LSTs), and system administrators.

This guide details how to integrate a frontend application with the FBO LaunchPad backend API, specifically focusing on the CSR MVP functionality.

## API Base URL

The base URL for all API calls should be configured through environment variables in your frontend application:

```javascript
// Example using Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
```

For local development, the default URL is: `http://localhost:5001/api`

## Authentication Flow

### Login Process

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
    "email": "user@example.com",
    "password": "userpassword"
}
```

**Success Response (200 OK):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "CSR",
        "is_active": true
    }
}
```

**Error Response (401 Unauthorized):**
```json
{
    "error": "Invalid credentials"
}
```

### Using the JWT Token

After successful login, the JWT token must be included in all subsequent API requests:

```javascript
headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
}
```

**Note:** The JWT token expires after 1 hour. Users must re-login to obtain a new token as token refresh is not implemented in the MVP.

## Required CSR Endpoints

### 1. Get Active LSTs

**Purpose:** Retrieve a list of active Line Service Technicians for fuel order assignment.

**Endpoint:** `GET /api/users?role=LST&is_active=true`

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
    "message": "Users retrieved successfully",
    "users": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "LST",
            "is_active": true
        }
    ]
}
```

### 2. Get Active Fuel Trucks

**Purpose:** Retrieve a list of active fuel trucks for fuel order creation.

**Endpoint:** `GET /api/fuel-trucks?is_active=true`

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
    "message": "Fuel trucks retrieved successfully",
    "fuel_trucks": [
        {
            "id": 1,
            "truck_number": "TRUCK001",
            "fuel_type": "Jet A",
            "capacity": "5000.00",
            "current_meter_reading": "1234.56",
            "is_active": true
        }
    ]
}
```

### 3. Create Fuel Order

**Purpose:** Create a new fuel order.

**Endpoint:** `POST /api/fuel-orders`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
    "aircraft_id": 1,
    "customer_id": 1,
    "fuel_type": "Jet A",
    "quantity": "1000.00",
    "assigned_lst_id": 1,
    "assigned_truck_id": 1,
    "notes": "Optional notes about the order"
}
```

**Success Response (201 Created):**
```json
{
    "message": "Fuel order created successfully",
    "fuel_order": {
        "id": 1,
        "status": "PENDING",
        "aircraft_id": 1,
        "customer_id": 1,
        "fuel_type": "Jet A",
        "quantity": "1000.00",
        "assigned_lst_id": 1,
        "assigned_truck_id": 1,
        "notes": "Optional notes about the order",
        "created_at": "2024-03-26T10:00:00Z"
    }
}
```

### 4. List Fuel Orders

**Purpose:** Retrieve a paginated list of fuel orders with optional filters.

**Endpoint:** `GET /api/fuel-orders`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 20): Items per page
- `status` (optional): Filter by order status (PENDING, IN_PROGRESS, COMPLETED, etc.)

**Success Response (200 OK):**
```json
{
    "message": "Fuel orders retrieved successfully",
    "fuel_orders": [
        {
            "id": 1,
            "status": "PENDING",
            "aircraft_id": 1,
            "customer_id": 1,
            "fuel_type": "Jet A",
            "quantity": "1000.00",
            "assigned_lst_id": 1,
            "assigned_truck_id": 1,
            "notes": "Optional notes about the order",
            "created_at": "2024-03-26T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 50
    }
}
```

### 5. Get Single Fuel Order

**Purpose:** Retrieve detailed information about a specific fuel order.

**Endpoint:** `GET /api/fuel-orders/{order_id}`

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
    "message": "Fuel order retrieved successfully",
    "fuel_order": {
        "id": 1,
        "status": "PENDING",
        "aircraft_id": 1,
        "customer_id": 1,
        "fuel_type": "Jet A",
        "quantity": "1000.00",
        "assigned_lst_id": 1,
        "assigned_truck_id": 1,
        "notes": "Optional notes about the order",
        "created_at": "2024-03-26T10:00:00Z",
        "updated_at": "2024-03-26T10:00:00Z",
        "aircraft": {
            "id": 1,
            "tail_number": "N12345",
            "aircraft_type": "Boeing 737"
        },
        "customer": {
            "id": 1,
            "name": "Example Airlines",
            "email": "contact@example.com"
        },
        "assigned_lst": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

### 6. Mark Order as Reviewed

**Purpose:** Mark a completed fuel order as reviewed by CSR.

**Endpoint:** `PATCH /api/fuel-orders/{order_id}/review`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
    "review_notes": "Optional review notes"
}
```

**Success Response (200 OK):**
```json
{
    "message": "Fuel order reviewed successfully",
    "fuel_order": {
        "id": 1,
        "status": "REVIEWED",
        "review_notes": "Optional review notes",
        "reviewed_at": "2024-03-26T11:00:00Z"
    }
}
```

### 7. Export Orders to CSV

**Purpose:** Export fuel orders to CSV format.

**Endpoint:** `GET /api/fuel-orders/export`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date` (optional): Filter orders from this date (YYYY-MM-DD)
- `end_date` (optional): Filter orders until this date (YYYY-MM-DD)
- `status` (optional): Filter by order status

**Success Response:**
- Content-Type: text/csv
- File download with fuel order data

## Core Data Models

### FuelOrder
```typescript
interface FuelOrder {
    id: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
    aircraft_id: number;
    customer_id: number;
    fuel_type: string;
    quantity: string;  // Decimal as string
    assigned_lst_id: number;
    assigned_truck_id: number;
    notes?: string;
    created_at: string;  // ISO datetime
    updated_at: string;  // ISO datetime
    reviewed_at?: string;  // ISO datetime
    review_notes?: string;
}
```

### User (LST)
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: 'LST';
    is_active: boolean;
}
```

### FuelTruck
```typescript
interface FuelTruck {
    id: number;
    truck_number: string;
    fuel_type: string;
    capacity: string;  // Decimal as string
    current_meter_reading: string;  // Decimal as string
    is_active: boolean;
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
    "error": "Human-readable error message"
}
```

Common HTTP Status Codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (e.g., duplicate data)
- 500: Internal Server Error

## Implementation Tips

1. Always include error handling for both network errors and API errors
2. Implement token expiration handling and redirect to login
3. Use proper decimal handling for fuel quantities (strings to avoid floating-point issues)
4. Implement proper date/time handling for ISO 8601 timestamps
5. Consider implementing a request interceptor for token management
6. Use proper type definitions for API responses
7. Implement proper loading states for async operations 