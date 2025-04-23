from datetime import datetime
from src.app import db

class Aircraft(db.Model):
    """Aircraft model representing an aircraft in the system."""
    __tablename__ = 'aircraft'

    # Primary key - using tail number as per MVP requirements
    tail_number = db.Column(db.String(20), primary_key=True)
    
    # Foreign key to customers table
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = db.relationship('Customer', backref=db.backref('aircraft', lazy=True))

    def __repr__(self):
        """Return string representation of the aircraft."""
        return f'<Aircraft {self.tail_number}>' 