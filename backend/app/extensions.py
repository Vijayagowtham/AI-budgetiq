import sqlite3
import os
from config import Config

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'budgetiq.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            source TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    
    # Additive migrations — safe to run on every startup
    migrations = [
        ('ALTER TABLE users ADD COLUMN avatar TEXT', 'avatar column on users'),
        ('ALTER TABLE expenses ADD COLUMN description TEXT DEFAULT ""', 'description column on expenses'),
    ]
    for sql, label in migrations:
        try:
            conn.execute(sql)
            print(f"[DB Migration] Applied: {label}")
        except sqlite3.OperationalError:
            pass  # Column already exists — fine
        
    conn.commit()
    conn.close()

# Start local db
init_db()

# Compatibility stub
supabase_client = None
