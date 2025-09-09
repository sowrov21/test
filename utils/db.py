import sqlite3
from pathlib import Path
from config import DB_PATH

def get_db_connection():
    """Create and return a database connection"""
    return sqlite3.connect(DB_PATH)

def execute_query(query, params=None, fetchone=False):
    """Execute a database query and return results"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        conn.commit()
        
        if fetchone:
            return cursor.fetchone()
        return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if conn:
            conn.close()