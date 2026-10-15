from . import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime, timedelta


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # New columns for password reset. Both nullable since most users won't
    # have an active reset request most of the time.
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_reset_token(self):
        # token_urlsafe generates a long random string safe to put in a URL
        self.reset_token = secrets.token_urlsafe(32)
        # Token expires in 30 minutes
        self.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)
        return self.reset_token

    def verify_reset_token(self, token):
        # Checks the token matches AND hasn't expired
        if self.reset_token != token:
            return False
        if self.reset_token_expiry is None or datetime.utcnow() > self.reset_token_expiry:
            return False
        return True

    def clear_reset_token(self):
        # Called after a successful reset so the token can't be reused
        self.reset_token = None
        self.reset_token_expiry = None

    def __repr__(self):
        return f'<User {self.username}>'


class Find(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    latitude = db.Column(db.Numeric(10, 7), nullable=False)
    longitude = db.Column(db.Numeric(10, 7), nullable=False)
    label = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))
