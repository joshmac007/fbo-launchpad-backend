from datetime import datetime
from src.app import db


class Customer(db.Model):
    """Model representing a customer in the system (MVP version).
    Note: This is a simplified version for MVP and will be expanded significantly in the CRM module."""
    
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Customer {self.name}>' 