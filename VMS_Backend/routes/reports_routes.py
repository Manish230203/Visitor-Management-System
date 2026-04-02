from flask import Blueprint, jsonify, request
from db import get_db_connection
from flask import send_file
import pandas as pd
import io

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
    cursor.execute("SELECT COUNT(*) FROM visitor_requests")
    ytd = cursor.fetchone()[0]

    # AVG DAILY (last 30 days)
    cursor.execute("""
    SELECT 
        COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT DATE(check_in_time)), 0)
    FROM visitor_requests
    WHERE check_in_time >= CURRENT_DATE - INTERVAL '30 days'
     """)
    avg_daily = round(cursor.fetchone()[0] or 0, 2)
# ------------------ REPEAT VISITORS ------------------

    cursor.execute("""
            SELECT COUNT(DISTINCT visitor_id)
            FROM visitor_requests
        """)
    unique_visitors = cursor.fetchone()[0]
    
    repeat_ratio = round(total / unique_visitors, 2) if unique_visitors else 0
    repeat_percent = round((repeat_ratio - 1) * 100, 2) if unique_visitors else 0

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
    if period == "daily":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'HH24:00') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE DATE(check_in_time) = CURRENT_DATE
            GROUP BY label ORDER BY label
        """)
    elif period == "weekly":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Dy') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY label, DATE_TRUNC('day', check_in_time)
            ORDER BY DATE_TRUNC('day', check_in_time)
        """)
    elif period == "monthly":
         cursor.execute("""
            SELECT 'Week ' || TO_CHAR(check_in_time, 'W') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY label
            ORDER BY label
        """)
    elif period == "yearly":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Mon') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY label, DATE_TRUNC('month', check_in_time)
            ORDER BY DATE_TRUNC('month', check_in_time)
        """)
    else: # Default or Quarterly
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Mon') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= CURRENT_DATE - INTERVAL '90 days'
            GROUP BY label, DATE_TRUNC('month', check_in_time)
            ORDER BY DATE_TRUNC('month', check_in_time)
        """)
    
    trend = [{"name": r[0], "visitors": r[1]} for r in cursor.fetchall()]

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
            "repeatPercent": repeat_percent  # optional later
        },

        "trend": trend,
        "categorySplit": category_split,
        "denialTracking": [],

        "advancedInsights": {
            "topDepartments": top_departments,
            "topVendors": top_vendors,
            "avgDuration": avg_duration,
            "gateTraffic": [],
            "repeatRatio": repeat_ratio
        },

        "visitors": visitors
    })
@reports_bp.route("/api/reports/export-excel", methods=["GET"])
def export_excel():
    conn = get_db_connection()

    query = """
        SELECT 
            v.visitor_name,
            v.email,
            v.mobile_number,
            v.department,
            vr.purpose,
            vr.check_in_time,
            vr.check_out_time,
            vr.status
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        ORDER BY vr.created_at DESC
    """

    df = pd.read_sql(query, conn)
    conn.close()

    # Convert to Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')

    output.seek(0)

from flask import Blueprint, jsonify, request
from db import get_db_connection
from flask import send_file
import pandas as pd
import io

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
    cursor.execute("SELECT COUNT(*) FROM visitor_requests")
    ytd = cursor.fetchone()[0]

    # AVG DAILY (last 30 days)
    cursor.execute("""
    SELECT 
        COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT DATE(check_in_time)), 0)
    FROM visitor_requests
    WHERE check_in_time >= CURRENT_DATE - INTERVAL '30 days'
     """)
    avg_daily = round(cursor.fetchone()[0] or 0, 2)
# ------------------ REPEAT VISITORS ------------------

    cursor.execute("""
            SELECT COUNT(DISTINCT visitor_id)
            FROM visitor_requests
        """)
    unique_visitors = cursor.fetchone()[0]
    
    repeat_ratio = round(total / unique_visitors, 2) if unique_visitors else 0
    repeat_percent = round((repeat_ratio - 1) * 100, 2) if unique_visitors else 0

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
    if period == "daily":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'HH24:00') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE DATE(check_in_time) = CURRENT_DATE
            GROUP BY label ORDER BY label
        """)
    elif period == "weekly":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Dy') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY label, DATE_TRUNC('day', check_in_time)
            ORDER BY DATE_TRUNC('day', check_in_time)
        """)
    elif period == "monthly":
         cursor.execute("""
            SELECT 'Week ' || TO_CHAR(check_in_time, 'W') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY label
            ORDER BY label
        """)
    elif period == "yearly":
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Mon') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY label, DATE_TRUNC('month', check_in_time)
            ORDER BY DATE_TRUNC('month', check_in_time)
        """)
    else: # Default or Quarterly
        cursor.execute("""
            SELECT TO_CHAR(check_in_time, 'Mon') as label, COUNT(*) as visitors
            FROM visitor_requests
            WHERE check_in_time >= CURRENT_DATE - INTERVAL '90 days'
            GROUP BY label, DATE_TRUNC('month', check_in_time)
            ORDER BY DATE_TRUNC('month', check_in_time)
        """)
    
    trend = [{"name": r[0], "visitors": r[1]} for r in cursor.fetchall()]

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
            "repeatPercent": repeat_percent  # optional later
        },

        "trend": trend,
        "categorySplit": category_split,
        "denialTracking": [],

        "advancedInsights": {
            "topDepartments": top_departments,
            "topVendors": top_vendors,
            "avgDuration": avg_duration,
            "gateTraffic": [],
            "repeatRatio": repeat_ratio
        },

        "visitors": visitors
    })
@reports_bp.route("/api/reports/export-excel", methods=["GET"])
def export_excel():
    conn = get_db_connection()

    query = """
        SELECT 
            v.visitor_name,
            v.email,
            v.mobile_number,
            v.department,
            vr.purpose,
            vr.check_in_time,
            vr.check_out_time,
            vr.status
        FROM visitor_requests vr
        JOIN visitors v ON vr.visitor_id = v.visitor_id
        ORDER BY vr.created_at DESC
    """

    df = pd.read_sql(query, conn)
    conn.close()

    # Convert to Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')

    output.seek(0)

    return send_file(
        output,
        download_name="Visitor_Report.xlsx",
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
