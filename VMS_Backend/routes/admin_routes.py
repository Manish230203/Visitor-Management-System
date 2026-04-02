from flask import Blueprint, jsonify, request
from db import get_db_connection
import os
import time
from werkzeug.utils import secure_filename

admin_bp = Blueprint("admin", __name__)

UPLOAD_FOLDER = "uploads_users"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "jfif", "webp", "avif"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------------- USERS ----------------
@admin_bp.route("/admin/users", methods=["GET"])
def get_users():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT user_id, name, email, role, department, status,profile_photo
        FROM users
        ORDER BY user_id DESC
    """)

    users = cursor.fetchall()

    result = []

    for u in users:
        result.append({
            "id": u[0],
            "name": u[1],
            "email": u[2],
            "role": u[3],
            "department": u[4],
            "status": u[5],
            "profile_photo": u[6] 
        })

    cursor.close()
    conn.close()

    return jsonify(result)


# ---------------- SITES ----------------
@admin_bp.route("/admin/sites", methods=["GET"])
def get_sites():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT location, COUNT(*)
        FROM visitors
        GROUP BY location
        ORDER BY COUNT(*) DESC
    """)

    rows = cursor.fetchall()

    result = []

    for r in rows:
        result.append({
            "name": r[0],          
            "address": r[0],       
            "visitors": r[1],      
            "status": "Active"     
        })

    cursor.close()
    conn.close()

    return jsonify(result)


# ---------------- DASHBOARD STATS ----------------
@admin_bp.route("/admin/stats", methods=["GET"])
def dashboard_stats():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM visitors WHERE status='active'")
    active_visitors = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM visitor_requests WHERE status='PENDING'")
    pending = cursor.fetchone()[0]

    stats = {
        "users": total_users,
        "visitors": active_visitors,
        "pending": pending,
        "alerts": 3
    }

    cursor.close()
    conn.close()

    return jsonify(stats)


@admin_bp.route("/admin/charts", methods=["GET"])
def admin_charts():

    conn = get_db_connection()
    cursor = conn.cursor()

    # WEEKLY VISITORS
    cursor.execute("""
        SELECT
            TO_CHAR(scheduled_date, 'Dy') AS day,
            COUNT(*)
        FROM visitor_requests
        WHERE scheduled_date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY day
        ORDER BY MIN(scheduled_date)
    """)

    weekly = cursor.fetchall()

    visitData = []

    for w in weekly:
        visitData.append({
            "day": w[0],
            "visitors": w[1]
        })

    # VISIT PURPOSE
    cursor.execute("""
        SELECT purpose, COUNT(*)
        FROM visitor_requests
        GROUP BY purpose
    """)

    purposes = cursor.fetchall()

    colors = ["#2563eb", "#7c3aed", "#0891b2", "#f59e0b"]

    purposeData = []

    for i, p in enumerate(purposes):
        purposeData.append({
            "name": p[0],
            "value": p[1],
            "color": colors[i % len(colors)]
        })

    conn.close()

    return jsonify({
        "visitData": visitData,
        "purposeData": purposeData
    })


@admin_bp.route("/upload-photo", methods=["POST"])
def upload_photo():

    print("FILES:", request.files)  

    file = request.files.get("photo")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):

        filename = f"{int(time.time())}_{secure_filename(file.filename)}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file.save(filepath)

        image_url = f"http://localhost:5000/uploads_users/{filename}"

        return jsonify({
            "message": "Upload successful",
            "image_url": image_url
        })

    return jsonify({"error": "Invalid file type"}), 400


@admin_bp.route("/update-user-photo/<int:user_id>", methods=["PUT"])
def update_user_photo(user_id):

    data = request.get_json()
    print("DATA RECEIVED:", data)
    photo_url = data.get("photo_url")
    print("PHOTO URL:", photo_url)
    print("USER ID:", user_id)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users
        SET profile_photo = %s
        WHERE user_id = %s
    """, (photo_url, user_id))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Photo updated"})