import click
from flask.cli import with_appcontext
from .extensions import db

@click.command('create-admin')
@with_appcontext
def create_admin():
    """Create an admin user."""
    from .models.user import User
    from .models.role import Role
    
    # Check if admin already exists
    if User.query.filter_by(email='admin@fbolaunchpad.com').first():
        click.echo("Admin user already exists!")
        return
    
    # Get admin role
    admin_role = Role.query.filter_by(name='Administrator').first()
    if not admin_role:
        click.echo("Error: Administrator role not found!")
        return
    
    # Create new admin user
    admin = User(
        email='admin@fbolaunchpad.com',
        username='admin',
        name='Admin',
        is_active=True
    )
    admin.set_password('Admin123!')
    admin.roles = [admin_role]
    
    # Save to database
    db.session.add(admin)
    db.session.commit()
    click.echo("Admin user created successfully!")

def init_app(app):
    """Register CLI commands."""
    app.cli.add_command(create_admin) 