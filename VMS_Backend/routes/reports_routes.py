from flask import Blueprint, jsonify, request
from db import get_db_connection

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/api/reports", methods=["GET"])
def get_reports():

    conn = get_db_connection()
    cursor = conn.cursor()

    period = request.args.get("period", "daily")

    # ------------------ SUMMARY ------------------

    # TOTAL
    cursor.execute("SELECT COUNT(*) FROM visitor_requests")
    total = cursor.fetchone()[0]

    # TODAY
    cursor.execute("""
        SELECT COUNT(*) FROM visitor_requests
        WHERE DATE(check_in_time) = CURRENT_DATE
    """)
    today = cursor.fetchone()[0]

    # MTD
    cursor.execute("""
        SELECT COUNT(*) FROM visitor_requests
        WHERE DATE_TRUNC('month', check_in_time) = DATE_TRUNC('month', CURRENT_DATE)
    """)
    mtd = cursor.fetchone()[0]

    # YTD
    cursor.execute("""
        SELECT COUNT(*) FROM visitor_requests
        WHERE DATE_TRUNC('year', check_in_time) = DATE_TRUNC('year', CURRENT_DATE)
    """)
    ytd = cursor.fetchone()[0]

    # AVG DAILY (last 30 days)
    cursor.execute("""
        SELECT COUNT(*) / 30.0 FROM visitor_requests
        WHERE check_in_time >= CURRENT_DATE - INTERVAL '30 days'
    """)
    avg_daily = round(cursor.fetchone()[0] or 0, 2)

    # ------------------ PEAK HOUR ------------------
    cursor.execute("""
        SELECT TO_CHAR(check_in_time, 'HH24:00') as hour, COUNT(*)
        FROM visitor_requests
        WHERE check_in_time IS NOT NULL
        GROUP BY hour
        ORDER BY COUNT(*) DESC
        LIMIT 1
    """)
    peak = cursor.fetchone()
    peak_hour = peak[0] if peak else "N/A"

    # ------------------ CATEGORY SPLIT ------------------
    cursor.execute("""
        SELECT purpose, COUNT(*)
        FROM visitor_requests
        GROUP BY purpose
    """)
    category_split = [{"name": r[0], "value": r[1]} for r in cursor.fetchall()]

    # ------------------ TREND ------------------
    cursor.execute("""
        SELECT TO_CHAR(check_in_time, 'HH24:00'), COUNT(*)
        FROM visitor_requests
        WHERE check_in_time IS NOT NULL
        GROUP BY TO_CHAR(check_in_time, 'HH24:00')
        ORDER BY 1
    """)
    trend = [{"label": r[0], "visitors": r[1]} for r in cursor.fetchall()]

    # ------------------ TOP DEPARTMENTS ------------------
    cursor.execute("""
        SELECT v.department, COUNT(*)
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        GROUP BY v.department
        ORDER BY COUNT(*) DESC
        LIMIT 5
    """)
    top_departments = [{"name": r[0] or "Unknown", "count": r[1]} for r in cursor.fetchall()]

    # ------------------ TOP VENDORS ------------------
    cursor.execute("""
        SELECT v.company_name, COUNT(*)
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        GROUP BY v.company_name
        ORDER BY COUNT(*) DESC
        LIMIT 5
    """)
    top_vendors = [{"name": r[0] or "Unknown", "count": r[1]} for r in cursor.fetchall()]

    # ------------------ VISIT DURATION ------------------
    cursor.execute("""
        SELECT AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time))/60)
        FROM visitor_requests
        WHERE check_in_time IS NOT NULL AND check_out_time IS NOT NULL
    """)
    avg_duration = cursor.fetchone()[0]
    avg_duration = round(avg_duration or 0, 2)

    # ------------------ VISITOR LIST ------------------
    cursor.execute("""
        SELECT vr.request_id, v.visitor_name, v.email, v.mobile_number,
               vr.purpose, v.department,
               vr.check_in_time, vr.check_out_time, vr.status
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        ORDER BY vr.created_at DESC
        LIMIT 50
    """)

    visitors = []
    for r in cursor.fetchall():
        visitors.append({
            "visitor_id": r[0],
            "name": r[1],
            "email": r[2],
            "phone": r[3],
            "purpose": r[4],
            "department": r[5],
            "category": r[4],
            "check_in": r[6],
            "check_out": r[7],
            "status": "checked_in" if r[7] is None else "checked_out"
        })

    conn.close()

    return jsonify({
        "summary": {
            "todayCount": today,
            "mtdCount": mtd,
            "ytdCount": ytd,
            "avgDaily": avg_daily,
            "deniedPercent": 0,  # optional later
            "peakHour": peak_hour,
            "repeatPercent": 0   # optional later
        },

        "trend": trend,
        "categorySplit": category_split,
        "denialTracking": [],

        "advancedInsights": {
            "topDepartments": top_departments,
            "topVendors": top_vendors,
            "avgDuration": avg_duration,
            "gateTraffic": [],
            "repeatRatio": 0
        },

        "visitors": visitors
    })