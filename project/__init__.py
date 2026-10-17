from flask import Flask, request, jsonify, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
import logging
import os
from dotenv import load_dotenv


db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    load_dotenv()

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Supabase gives you one connection string instead of four separate values.
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise RuntimeError(
            'DATABASE_URL is not set. In Supabase click Connect, copy the '
            'Session pooler URI, and put it in your .env file.'
        )
    # Some hosts hand out "postgres://", which SQLAlchemy rejects.
    for prefix in ('postgres://', 'postgresql://'):
        if database_url.startswith(prefix):
            database_url = 'postgresql+psycopg2://' + database_url[len(prefix):]
            break

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    # Supabase closes idle connections; this tests each one before using it.
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True}

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    with app.app_context():
        from .models import User, Find

        db.create_all()

        return app
