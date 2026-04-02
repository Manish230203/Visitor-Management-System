<<<<<<< HEAD
# db.py

import psycopg2
from config import DB_CONFIG

def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print("Database connection error:", e)
=======
# db.py

import psycopg2
from config import DB_CONFIG

def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print("Database connection error:", e)
>>>>>>> 08ef6cc1453d6ea4244a647f389ddbdb18b9b7d1
        return None