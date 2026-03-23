# routes/visitor_routes.py

from flask import Blueprint, request, jsonify
import psycopg2.extras
from db import get_db_connection

visitor_bp = Blueprint("visitors", __name__)

@visitor_bp.route("/api/visitors", methods=["GET"])
def get_visitors():
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM visitors ORDER BY visitor_id DESC")
        visitors = cursor.fetchall()
        return jsonify(visitors), 200

    finally:
        conn.close()


@visitor_bp.route("/api/visitors", methods=["POST"])
def create_visitor():
    data = request.get_json()
    conn = get_db_connection()

    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if visitor already exists by mobile
        cursor.execute("""
            SELECT visitor_id
            FROM visitors
            WHERE mobile_number = %s
            LIMIT 1
        """, (data.get("mobile_number"),))

        existing = cursor.fetchone()

        if existing:
            visitor_id = existing["visitor_id"]
        else:
            cursor.execute("""
                INSERT INTO visitors (
                    visitor_name, company_name, email, mobile_number,
                    id_proof_type, id_proof_number,
                    employee_id, full_name, pabx_number,
                    unit, department, location,
                    access_level, reason_of_visit
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING visitor_id;
            """, (
                data.get("visitor_name"),
                data.get("company_name"),
                data.get("email"),
                data.get("mobile_number"),
                data.get("id_proof_type"),
                data.get("id_proof_number"),
                data.get("employee_id"),
                data.get("full_name"),
                data.get("pabx_number"),
                data.get("unit"),
                data.get("department"),
                data.get("location"),
                data.get("access_level"),
                data.get("reason_of_visit")
            ))

            visitor_id = cursor.fetchone()["visitor_id"]

        # Always create a NEW visit request
        cursor.execute("""
            INSERT INTO visitor_requests (
                visitor_id,
                host_id,
                purpose,
                scheduled_date,
                scheduled_time,
                status,
                created_at
            )
            VALUES (%s,%s,%s,CURRENT_DATE,CURRENT_TIME,'PENDING',NOW())
        """, (
            visitor_id,
            data.get("employee_id"),
            data.get("reason_of_visit")
        ))

        conn.commit()

        return jsonify({"message": "Visit request created"}), 201

    finally:
        conn.close()
        
@visitor_bp.route("/api/visit-purpose", methods=["GET"])
def get_visit_purpose():

    conn = get_db_connection()

    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT purpose, COUNT(*) as value
            FROM visitor_requests
            GROUP BY purpose
        """)

        rows = cursor.fetchall()

        # Assign colors for chart
        colors = {
            "Meeting": "#2563EB",
            "Interview": "#10B981",
            "Delivery": "#F59E0B",
            "Maintenance": "#6366F1"
        }

        result = []

        for row in rows:
            result.append({
                "name": row["purpose"],
                "value": row["value"],
                "color": colors.get(row["purpose"], "#8884d8")
            })

        return jsonify(result), 200

    finally:
        conn.close()