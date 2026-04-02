# db.py

import psycopg2
from config import DB_CONFIG

def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print("Database connection error:", e)
        return None