from marshmallow import Schema, fields, validate

class RegisterRequestSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

class UserResponseSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)
    role = fields.Str(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class RegisterResponseSchema(Schema):
    message = fields.Str(dump_only=True)
    user = fields.Nested(UserResponseSchema, dump_only=True)

class LoginRequestSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class LoginSuccessResponseSchema(Schema):
    access_token = fields.Str(dump_only=True)

class ErrorResponseSchema(Schema):
    error = fields.Str(dump_only=True) 