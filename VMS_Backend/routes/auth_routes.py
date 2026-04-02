# routes/auth_routes.py

from flask import Blueprint, request, jsonify
import psycopg2.extras
from db import get_db_connection
from utils.token_utils import generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()

    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        if user["password"] != password:
            return jsonify({"message": "Invalid password"}), 401

        token = generate_token(user)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user
        }), 200

    finally:
        conn.close()