<<<<<<< HEAD
from flask import Blueprint, jsonify, request
from db import get_db_connection
from flask import request
import time
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta

security_bp = Blueprint("security", __name__)


# ---------------------------------------------------
# SECURITY DASHBOARD STATS
# ---------------------------------------------------

@security_bp.route("/api/security/dashboard", methods=["GET"])
def security_dashboard():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE check_in_time IS NOT NULL
            AND check_out_time IS NULL
        """)
        visitors_inside = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE scheduled_date = CURRENT_DATE
            AND status = 'APPROVED'
        """)
        expected_today = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE status = 'PENDING'
        """)
        pending_approval = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE check_in_time IS NOT NULL
            AND check_out_time IS NULL
            AND NOW() - check_in_time > INTERVAL '2 hours'
        """)
        overstay = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            "visitors_inside": visitors_inside,
            "expected_today": expected_today,
            "pending_approval": pending_approval,
            "overstay_alerts": overstay
        })

    except Exception as e:
        print("🔥 ERROR dashboard:", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------
# LIVE VISITORS
# ---------------------------------------------------
@security_bp.route("/api/security/live-visitors", methods=["GET"])
def live_visitors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
            vr.request_id,
            v.visitor_name,
            v.company_name,
            u.name,
            vr.check_in_time,
            v.photo,
            approver.name,
            v.access_level,
            v.employee_id
            FROM visitor_requests vr
            LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
            LEFT JOIN users u ON vr.host_id = u.user_id
            LEFT JOIN users approver ON vr.approved_by = approver.user_id
            WHERE vr.check_in_time IS NOT NULL
            AND vr.check_out_time IS NULL
            ORDER BY vr.check_in_time DESC
        """)

        rows = cursor.fetchall()

        visitors = []

        for r in rows:
            check_in_time = r[4]
            status = "Inside"

            if check_in_time and isinstance(check_in_time, datetime) and datetime.now() - check_in_time > timedelta(hours=2):
                status = "Overstay"

            visitors.append({
                "request_id": r[0],
                "name": r[1],
                "company": r[2],
                "host": r[3],
                "checkIn": str(check_in_time),
                "badge": f"V-{1000+r[0]}",
                "status": status,
                "photo": r[5] if r[5] else None,
                "approver": r[6],
                "access_level": r[7],
                "employee_id": r[8]
            })

        conn.close()
        return jsonify(visitors)

    except Exception as e:
        print("🔥 ERROR live_visitors:", e)
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------
# EXPECTED VISITORS
# ---------------------------------------------------

@security_bp.route("/api/security/expected-visitors", methods=["GET"])
def expected_visitors():

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT
    vr.request_id,
    v.visitor_name,
    v.company_name,
    u.name,
    vr.purpose,
    vr.scheduled_time,
    v.access_level,
    v.employee_id
    FROM visitor_requests vr
    LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.host_id = u.user_id
    WHERE vr.status = 'APPROVED'
    AND vr.scheduled_date = CURRENT_DATE
    AND vr.check_in_time IS NULL
    ORDER BY vr.scheduled_time
""")
    rows = cursor.fetchall()

    visitors = []

    for r in rows:
        visitors.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "purpose": r[4],
            "time": str(r[5]),
            "access_level": r[6],
            "employee_id": r[7]
        })

    conn.close()
    return jsonify(visitors)


# ---------------------------------------------------
# PENDING REQUESTS
# ---------------------------------------------------

@security_bp.route("/api/security/pending-requests", methods=["GET"])
def pending_requests():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
    vr.request_id,
    v.visitor_name,
    v.company_name,
    v.mobile_number,
    u.name,
    vr.purpose,
    v.access_level,
    v.employee_id
    FROM visitor_requests vr
    JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.host_id = u.user_id
    WHERE vr.status = 'PENDING'
    ORDER BY vr.created_at DESC
""")

    rows = cursor.fetchall()

    requests = []

    for r in rows:
        requests.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "mobile": r[3],
            "host": r[4],
            "purpose": r[5],
            "time": "Just now",
            "access_level": r[6],
            "employee_id": r[7]
        })

    conn.close()
    return jsonify(requests)


# ---------------------------------------------------
# CHECK IN VISITOR
# ---------------------------------------------------

@security_bp.route("/api/security/checkin/<int:request_id>", methods=["POST"])
def checkin_visitor(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET check_in_time = NOW()
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Visitor checked in successfully"})


# ---------------------------------------------------
# CHECK OUT VISITOR
# ---------------------------------------------------

@security_bp.route("/api/security/checkout/<int:request_id>", methods=["POST"])
def checkout_visitor(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET check_out_time = NOW()
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Visitor checked out successfully"})


# ---------------------------------------------------
# SEARCH VISITORS
# ---------------------------------------------------

@security_bp.route("/api/security/search", methods=["GET"])
def search_visitors():

    query = request.args.get("query")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
        vr.request_id,
        v.visitor_name,
        v.company_name,
        u.name,
        vr.check_in_time,
        vr.check_out_time
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        LEFT JOIN users u ON vr.host_id = u.user_id
        WHERE LOWER(v.visitor_name) LIKE LOWER(%s)
    """, (f"%{query}%",))

    rows = cursor.fetchall()

    visitors = []

    for r in rows:

        status = "Inside"

        if r[5] is not None:
            status = "Checked Out"

        visitors.append({
            "request_id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "checkIn": str(r[4]) if r[4] else "-",
            "status": status
        })

    conn.close()
    return jsonify(visitors)


# ---------------------------------------------------
# RECENT ACTIVITY
# ---------------------------------------------------
@security_bp.route("/api/security/recent-activity", methods=["GET"])
def recent_activity():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        vr.request_id,
        v.visitor_name,

        -- Convert email to name
        INITCAP(SPLIT_PART(u.email,'@',1)) AS approver_name,

        vr.status,
        vr.created_at,
        vr.check_in_time,
        vr.check_out_time,
        vr.approved_at

    FROM visitor_requests vr
    LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.approved_by = u.user_id

    WHERE DATE(COALESCE(vr.check_in_time, vr.approved_at, vr.created_at)) = CURRENT_DATE

    ORDER BY COALESCE(vr.check_in_time, vr.approved_at, vr.created_at) DESC
    LIMIT 10
    """)

    rows = cursor.fetchall()

    activity = []

    for r in rows:

        request_id = r[0]
        visitor = r[1]
        approved_by = r[2] if r[2] else "Security"
        status = r[3]
        created = r[4]
        checkin = r[5]
        checkout = r[6]
        approved = r[7]

        # Approved activity
        if status == "APPROVED":
            activity.append({
                "action": "Approved",
                "name": visitor,
                "detail": f"Approved by {approved_by}",
                "time": str(approved)
            })

        # Check-in activity
        if checkin:
            activity.append({
                "action": "Check-in",
                "name": visitor,
                "detail": f"Badge V-{1000 + request_id} issued",
                "time": str(checkin)
            })

        # Check-out activity
        if checkout:
            activity.append({
                "action": "Check-out",
                "name": visitor,
                "detail": "Visitor exited",
                "time": str(checkout)
            })

    conn.close()

    return jsonify(activity)



UPLOAD_FOLDER = "uploads"

@security_bp.route("/api/security/upload-photo/<int:request_id>", methods=["POST"])
def upload_visitor_photo(request_id):

    if "photo" not in request.files:
        return {"error": "No file"}, 400

    file = request.files["photo"]

  

    filename = f"{int(time.time())}_{secure_filename(file.filename)}"

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    conn = get_db_connection()
    cursor = conn.cursor()

    # get visitor_id from request_id
    cursor.execute("""
        SELECT visitor_id
        FROM visitor_requests
        WHERE request_id = %s
    """, (request_id,))

    visitor_id = cursor.fetchone()[0]

    cursor.execute("""
     UPDATE visitors
     SET photo = %s
     WHERE visitor_id = %s
""", (f"uploads/{filename}", visitor_id))

    conn.commit()
    conn.close()

    return {"message": "Photo uploaded"}
    
@security_bp.route("/api/security/spot-requests", methods=["GET"])
def spot_requests():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
        vr.request_id,
        v.visitor_name,
        v.company_name,
        u.name,
        vr.purpose,
        vr.created_at
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        LEFT JOIN users u ON vr.host_id = u.user_id
        WHERE vr.status NOT IN ('APPROVED','REJECTED')
        ORDER BY vr.created_at DESC
    """)

    rows = cursor.fetchall()

    requests = []

    for r in rows:
        requests.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "purpose": r[4],
            "time": str(r[5])
        })

    conn.close()
    return jsonify(requests)

@security_bp.route("/api/security/approve-request/<int:request_id>", methods=["POST"])
def approve_request(request_id):

    data = request.get_json()  # 🔥 ADD THIS

    conn = get_db_connection()
    cursor = conn.cursor()

    approver_id = data.get("approved_by")

    cursor.execute("""
     UPDATE visitor_requests
     SET status = 'APPROVED',
        approved_by = %s,
        approved_at = NOW()
      WHERE request_id = %s
      RETURNING visitor_id
    """,(approver_id, request_id))

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
    conn.close()

    return jsonify({"message": "Request approved"})

@security_bp.route("/api/security/reject-request/<int:request_id>", methods=["POST"])
def reject_request(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET status = 'REJECTED'
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

=======
from flask import Blueprint, jsonify, request
from db import get_db_connection
from flask import request
import time
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta

security_bp = Blueprint("security", __name__)


# ---------------------------------------------------
# SECURITY DASHBOARD STATS
# ---------------------------------------------------

@security_bp.route("/api/security/dashboard", methods=["GET"])
def security_dashboard():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE check_in_time IS NOT NULL
            AND check_out_time IS NULL
        """)
        visitors_inside = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE scheduled_date = CURRENT_DATE
            AND status = 'APPROVED'
        """)
        expected_today = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE status = 'PENDING'
        """)
        pending_approval = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM visitor_requests
            WHERE check_in_time IS NOT NULL
            AND check_out_time IS NULL
            AND NOW() - check_in_time > INTERVAL '2 hours'
        """)
        overstay = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            "visitors_inside": visitors_inside,
            "expected_today": expected_today,
            "pending_approval": pending_approval,
            "overstay_alerts": overstay
        })

    except Exception as e:
        print("🔥 ERROR dashboard:", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------
# LIVE VISITORS
# ---------------------------------------------------
@security_bp.route("/api/security/live-visitors", methods=["GET"])
def live_visitors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
            vr.request_id,
            v.visitor_name,
            v.company_name,
            u.name,
            vr.check_in_time,
            v.photo,
            approver.name,
            v.access_level,
            v.employee_id
            FROM visitor_requests vr
            LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
            LEFT JOIN users u ON vr.host_id = u.user_id
            LEFT JOIN users approver ON vr.approved_by = approver.user_id
            WHERE vr.check_in_time IS NOT NULL
            AND vr.check_out_time IS NULL
            ORDER BY vr.check_in_time DESC
        """)

        rows = cursor.fetchall()

        visitors = []

        for r in rows:
            check_in_time = r[4]
            status = "Inside"

            if check_in_time and isinstance(check_in_time, datetime) and datetime.now() - check_in_time > timedelta(hours=2):
                status = "Overstay"

            visitors.append({
                "request_id": r[0],
                "name": r[1],
                "company": r[2],
                "host": r[3],
                "checkIn": str(check_in_time),
                "badge": f"V-{1000+r[0]}",
                "status": status,
                "photo": r[5] if r[5] else None,
                "approver": r[6],
                "access_level": r[7],
                "employee_id": r[8]
            })

        conn.close()
        return jsonify(visitors)

    except Exception as e:
        print("🔥 ERROR live_visitors:", e)
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------
# EXPECTED VISITORS
# ---------------------------------------------------

@security_bp.route("/api/security/expected-visitors", methods=["GET"])
def expected_visitors():

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT
    vr.request_id,
    v.visitor_name,
    v.company_name,
    u.name,
    vr.purpose,
    vr.scheduled_time,
    v.access_level,
    v.employee_id
    FROM visitor_requests vr
    LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.host_id = u.user_id
    WHERE vr.status = 'APPROVED'
    AND vr.scheduled_date = CURRENT_DATE
    AND vr.check_in_time IS NULL
    ORDER BY vr.scheduled_time
""")
    rows = cursor.fetchall()

    visitors = []

    for r in rows:
        visitors.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "purpose": r[4],
            "time": str(r[5]),
            "access_level": r[6],
            "employee_id": r[7]
        })

    conn.close()
    return jsonify(visitors)


# ---------------------------------------------------
# PENDING REQUESTS
# ---------------------------------------------------

@security_bp.route("/api/security/pending-requests", methods=["GET"])
def pending_requests():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
    vr.request_id,
    v.visitor_name,
    v.company_name,
    v.mobile_number,
    u.name,
    vr.purpose,
    v.access_level,
    v.employee_id
    FROM visitor_requests vr
    JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.host_id = u.user_id
    WHERE vr.status = 'PENDING'
    ORDER BY vr.created_at DESC
""")

    rows = cursor.fetchall()

    requests = []

    for r in rows:
        requests.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "mobile": r[3],
            "host": r[4],
            "purpose": r[5],
            "time": "Just now",
            "access_level": r[6],
            "employee_id": r[7]
        })

    conn.close()
    return jsonify(requests)


# ---------------------------------------------------
# CHECK IN VISITOR
# ---------------------------------------------------

@security_bp.route("/api/security/checkin/<int:request_id>", methods=["POST"])
def checkin_visitor(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET check_in_time = NOW()
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Visitor checked in successfully"})


# ---------------------------------------------------
# CHECK OUT VISITOR
# ---------------------------------------------------

@security_bp.route("/api/security/checkout/<int:request_id>", methods=["POST"])
def checkout_visitor(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET check_out_time = NOW()
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Visitor checked out successfully"})


# ---------------------------------------------------
# SEARCH VISITORS
# ---------------------------------------------------

@security_bp.route("/api/security/search", methods=["GET"])
def search_visitors():

    query = request.args.get("query")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
        vr.request_id,
        v.visitor_name,
        v.company_name,
        u.name,
        vr.check_in_time,
        vr.check_out_time
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        LEFT JOIN users u ON vr.host_id = u.user_id
        WHERE LOWER(v.visitor_name) LIKE LOWER(%s)
    """, (f"%{query}%",))

    rows = cursor.fetchall()

    visitors = []

    for r in rows:

        status = "Inside"

        if r[5] is not None:
            status = "Checked Out"

        visitors.append({
            "request_id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "checkIn": str(r[4]) if r[4] else "-",
            "status": status
        })

    conn.close()
    return jsonify(visitors)


# ---------------------------------------------------
# RECENT ACTIVITY
# ---------------------------------------------------
@security_bp.route("/api/security/recent-activity", methods=["GET"])
def recent_activity():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        vr.request_id,
        v.visitor_name,

        -- Convert email to name
        INITCAP(SPLIT_PART(u.email,'@',1)) AS approver_name,

        vr.status,
        vr.created_at,
        vr.check_in_time,
        vr.check_out_time,
        vr.approved_at

    FROM visitor_requests vr
    LEFT JOIN visitors v ON vr.visitor_id = v.visitor_id
    LEFT JOIN users u ON vr.approved_by = u.user_id

    WHERE DATE(COALESCE(vr.check_in_time, vr.approved_at, vr.created_at)) = CURRENT_DATE

    ORDER BY COALESCE(vr.check_in_time, vr.approved_at, vr.created_at) DESC
    LIMIT 10
    """)

    rows = cursor.fetchall()

    activity = []

    for r in rows:

        request_id = r[0]
        visitor = r[1]
        approved_by = r[2] if r[2] else "Security"
        status = r[3]
        created = r[4]
        checkin = r[5]
        checkout = r[6]
        approved = r[7]

        # Approved activity
        if status == "APPROVED":
            activity.append({
                "action": "Approved",
                "name": visitor,
                "detail": f"Approved by {approved_by}",
                "time": str(approved)
            })

        # Check-in activity
        if checkin:
            activity.append({
                "action": "Check-in",
                "name": visitor,
                "detail": f"Badge V-{1000 + request_id} issued",
                "time": str(checkin)
            })

        # Check-out activity
        if checkout:
            activity.append({
                "action": "Check-out",
                "name": visitor,
                "detail": "Visitor exited",
                "time": str(checkout)
            })

    conn.close()

    return jsonify(activity)



UPLOAD_FOLDER = "uploads"

@security_bp.route("/api/security/upload-photo/<int:request_id>", methods=["POST"])
def upload_visitor_photo(request_id):

    if "photo" not in request.files:
        return {"error": "No file"}, 400

    file = request.files["photo"]

  

    filename = f"{int(time.time())}_{secure_filename(file.filename)}"

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    conn = get_db_connection()
    cursor = conn.cursor()

    # get visitor_id from request_id
    cursor.execute("""
        SELECT visitor_id
        FROM visitor_requests
        WHERE request_id = %s
    """, (request_id,))

    visitor_id = cursor.fetchone()[0]

    cursor.execute("""
     UPDATE visitors
     SET photo = %s
     WHERE visitor_id = %s
""", (f"uploads/{filename}", visitor_id))

    conn.commit()
    conn.close()

    return {"message": "Photo uploaded"}
    
@security_bp.route("/api/security/spot-requests", methods=["GET"])
def spot_requests():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
        vr.request_id,
        v.visitor_name,
        v.company_name,
        u.name,
        vr.purpose,
        vr.created_at
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        LEFT JOIN users u ON vr.host_id = u.user_id
        WHERE vr.status NOT IN ('APPROVED','REJECTED')
        ORDER BY vr.created_at DESC
    """)

    rows = cursor.fetchall()

    requests = []

    for r in rows:
        requests.append({
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "host": r[3],
            "purpose": r[4],
            "time": str(r[5])
        })

    conn.close()
    return jsonify(requests)

@security_bp.route("/api/security/approve-request/<int:request_id>", methods=["POST"])
def approve_request(request_id):

    data = request.get_json()  # 🔥 ADD THIS

    conn = get_db_connection()
    cursor = conn.cursor()

    approver_id = data.get("approved_by")

    cursor.execute("""
     UPDATE visitor_requests
     SET status = 'APPROVED',
        approved_by = %s,
        approved_at = NOW()
      WHERE request_id = %s
      RETURNING visitor_id
    """,(approver_id, request_id))

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
    conn.close()

    return jsonify({"message": "Request approved"})

@security_bp.route("/api/security/reject-request/<int:request_id>", methods=["POST"])
def reject_request(request_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE visitor_requests
        SET status = 'REJECTED'
        WHERE request_id = %s
    """, (request_id,))

    conn.commit()
    conn.close()

>>>>>>> 08ef6cc1453d6ea4244a647f389ddbdb18b9b7d1
    return jsonify({"message": "Request rejected"})