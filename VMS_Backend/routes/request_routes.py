# routes/request_routes.py

from flask import Blueprint, request, jsonify
import psycopg2.extras
from db import get_db_connection

request_bp = Blueprint("request_bp", __name__)

@request_bp.route("/api/visitor-requests", methods=["GET"])
def get_requests():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT vr.*, v.visitor_name, v.company_name
            FROM visitor_requests vr
            JOIN visitors v ON vr.visitor_id = v.visitor_id
            ORDER BY vr.created_at DESC
        """)

        requests = cursor.fetchall()

        # ✅ Convert DATE, TIME, TIMESTAMP to string
        for req in requests:
            if req.get("scheduled_date"):
                req["scheduled_date"] = str(req["scheduled_date"])
            if req.get("scheduled_time"):
                req["scheduled_time"] = str(req["scheduled_time"])
            if req.get("approved_at"):
                req["approved_at"] = str(req["approved_at"])
            if req.get("created_at"):
                req["created_at"] = str(req["created_at"])
            if req.get("check_in_time"):
                req["check_in_time"] = str(req["check_in_time"])
            if req.get("check_out_time"):
                req["check_out_time"] = str(req["check_out_time"])

        return jsonify(requests), 200

    finally:
        conn.close()

@request_bp.route("/api/visitor-requests", methods=["POST"])
def create_request():
    data = request.get_json()
    conn = get_db_connection()

    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # 1️⃣ Insert visitor first
        cursor.execute("""
            INSERT INTO visitors (
            visitor_name,
            full_name, 
            email,
            mobile_number,
            pabx_number,
            unit,
            department,
            location,
            id_proof_type,
            id_proof_number,
            access_level,
            reason_of_visit,    
             employee_id  
)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
RETURNING visitor_id;
""", (
    data.get("visitor_name"),
    data.get("full_name"),
    data.get("email"),
    data.get("mobile_number"),
    data.get("pabx"),
    data.get("unit"),
    data.get("department"),
    data.get("location"),
    data.get("id_proof_type"),
    data.get("id_proof_number"),
    data.get("access_level"),
     data.get("purpose"),           
    data.get("host_id") 
))

        visitor = cursor.fetchone()
        visitor_id = visitor["visitor_id"]

        # 2️⃣ Insert request
        has_device = True if data.get("hasDevice") == "Yes" else False

        cursor.execute("""
            INSERT INTO visitor_requests (
                visitor_id,
                host_id,
                purpose,
                scheduled_date,
                scheduled_time,
                status,
                created_at,
                has_device,
                device_type,
                device_make,
                device_serial_number
            )
            VALUES (%s,%s,%s,CURRENT_DATE,CURRENT_TIME,'PENDING',NOW(),%s,%s,%s,%s)
            RETURNING *;
        """, (
            visitor_id,
            data.get("host_id"),
            data.get("purpose"),
            has_device,
            data.get("deviceType"),
            data.get("deviceMake"),
            data.get("deviceSerialNumber")
        ))

        new_request = cursor.fetchone()

        for key in new_request:
          if new_request[key] is not None:
           new_request[key] = str(new_request[key])
        conn.commit()
        return jsonify(new_request), 201

    finally:
        conn.close()


@request_bp.route("/api/visitor-requests/<int:request_id>/approve", methods=["PUT"])
def approve_request(request_id):
    data = request.get_json()
    conn = get_db_connection()

    try:
        cursor = conn.cursor()
        approver_id = data.get("approved_by")
        cursor.execute("""
            UPDATE visitor_requests
            SET status='APPROVED',
                approved_by=%s,
                approved_at=NOW()
            WHERE request_id=%s
            RETURNING visitor_id
        """, (approver_id, request_id))

        res = cursor.fetchone()
        if res:
            visitor_id = res[0]
            cursor.execute("""
                UPDATE visitors
                SET employee_id = %s
                WHERE visitor_id = %s AND employee_id IS NULL
            """, (str(approver_id), visitor_id))
            cursor.execute("""
                UPDATE visitor_requests
                SET host_id = %s
                WHERE request_id = %s AND host_id IS NULL
            """, (approver_id, request_id))

        conn.commit()
        return jsonify({"message": "Approved"}), 200
    finally:
        conn.close()
@request_bp.route("/api/visitor-requests/<int:request_id>/reject", methods=["PUT"])
def reject_request(request_id):
    data = request.get_json()
    conn = get_db_connection()

    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE visitor_requests
            SET status='REJECTED',
                approved_by=%s,
                approved_at=NOW()
            WHERE request_id=%s
        """, (data.get("approved_by"), request_id))

        conn.commit()
        return jsonify({"message": "Rejected"}), 200

    finally:
        conn.close()