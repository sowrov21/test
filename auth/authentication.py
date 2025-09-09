import streamlit as st
import sqlite3
from passlib.hash import pbkdf2_sha256
from config import DB_PATH, PASSWORD_HASH_ITERATIONS
from utils.db import get_db_connection

def verify_credentials(username, password):
    """Verify user credentials against the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT user_id, username, password_hash, role FROM users WHERE username = ?", 
            (username,)
        )
        user = cursor.fetchone()
        
        if user and pbkdf2_sha256.verify(password, user[2]):
            return {
                "user_id": user[0],
                "username": user[1],
                "role": user[3]
            }
        return None
    except sqlite3.Error as e:
        st.error(f"Database error: {e}")
        return None
    finally:
        if conn:
            conn.close()

def create_user(username, password, role="user", email=None):
    """Create a new user in the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return False, "Username already exists"
        
        # Hash password
        password_hash = pbkdf2_sha256.hash(password, rounds=PASSWORD_HASH_ITERATIONS)
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)",
            (username, password_hash, role, email)
        )
        conn.commit()
        return True, "User created successfully"
    except sqlite3.Error as e:
        return False, f"Database error: {e}"
    finally:
        if conn:
            conn.close()

def initialize_database():
    """Initialize the database with required tables"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create clients table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                client_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                company TEXT,
                status TEXT DEFAULT 'active',
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            )
        """)
        
        # Create admin user if not exists
        cursor.execute("SELECT username FROM users WHERE username = 'admin'")
        if not cursor.fetchone():
            password_hash = pbkdf2_sha256.hash("admin123", rounds=PASSWORD_HASH_ITERATIONS)
            cursor.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                ("admin", password_hash, "admin")
            )
        
        conn.commit()
    except sqlite3.Error as e:
        st.error(f"Database initialization error: {e}")
    finally:
        if conn:
            conn.close()