from .auth_schemas import (
    RegisterRequestSchema, UserResponseSchema, RegisterResponseSchema,
    LoginRequestSchema, LoginSuccessResponseSchema, ErrorResponseSchema
)

from .fuel_order_schemas import (
    FuelOrderCreateRequestSchema, FuelOrderStatusUpdateRequestSchema,
    FuelOrderCompleteRequestSchema, FuelOrderResponseSchema,
    FuelOrderBriefResponseSchema, FuelOrderCreateResponseSchema,
    FuelOrderUpdateResponseSchema, PaginationSchema, FuelOrderListResponseSchema,
    OrderStatusCountsSchema, OrderStatusCountsResponseSchema
) # Ensure all schemas are imported

from .fuel_truck_schemas import (
    FuelTruckSchema, FuelTruckListResponseSchema,
    FuelTruckCreateRequestSchema, FuelTruckCreateResponseSchema
)

from .admin_schemas import (
    AdminAircraftSchema, AdminAircraftListResponseSchema,
    AdminCustomerSchema, AdminCustomerListResponseSchema
)

from .role_schemas import (
    RoleSchema, RoleListResponseSchema,
    RoleCreateRequestSchema, RoleUpdateRequestSchema,
    RoleAssignPermissionRequestSchema
)

from .permission_schemas import PermissionSchema

from marshmallow import Schema, fields, validate

class ErrorResponseSchema(Schema):
    error = fields.String(required=True)
    details = fields.Dict(keys=fields.String(), values=fields.List(fields.String()), required=False)

class UserBaseSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=False)
    email = fields.Email(required=True)
    role = fields.String(required=True, validate=validate.OneOf(['ADMIN', 'CSR', 'LST']))
    is_active = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class UserCreateRequestSchema(UserBaseSchema):
    password = fields.String(required=True, load_only=True)
    is_active = fields.Boolean(required=False, load_only=True)

class UserUpdateRequestSchema(Schema):
    name = fields.String(required=False)
    role = fields.String(required=False, validate=validate.OneOf(['ADMIN', 'CSR', 'LST']))
    is_active = fields.Boolean(required=False)
    password = fields.String(required=False, load_only=True)

class UserResponseSchema(Schema):
    message = fields.String(required=True)
    user = fields.Nested(UserBaseSchema)

class UserListResponseSchema(Schema):
    message = fields.String(required=True)
    users = fields.List(fields.Nested(UserBaseSchema), required=True)

__all__ = [
    'RegisterRequestSchema', 'UserResponseSchema', 'RegisterResponseSchema',
    'LoginRequestSchema', 'LoginSuccessResponseSchema', 'ErrorResponseSchema',
    'FuelOrderCreateRequestSchema', 'FuelOrderStatusUpdateRequestSchema',
    'FuelOrderCompleteRequestSchema', 'FuelOrderResponseSchema',
    'FuelOrderBriefResponseSchema', 'FuelOrderCreateResponseSchema',
    'FuelOrderUpdateResponseSchema', 'PaginationSchema', 'FuelOrderListResponseSchema',
    'FuelTruckSchema', 'FuelTruckListResponseSchema',
    'FuelTruckCreateRequestSchema',
    'FuelTruckCreateResponseSchema',
    'UserBaseSchema',
    'UserCreateRequestSchema',
    'UserUpdateRequestSchema',
    'UserListResponseSchema',
    'OrderStatusCountsSchema', 'OrderStatusCountsResponseSchema',
    'AdminAircraftSchema', 'AdminAircraftListResponseSchema',
    'AdminCustomerSchema', 'AdminCustomerListResponseSchema',
    'RoleSchema', 'RoleListResponseSchema',
    'RoleCreateRequestSchema', 'RoleUpdateRequestSchema',
    'RoleAssignPermissionRequestSchema',
    'PermissionSchema'
] # Ensure schemas are exported