from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.reports_routes import reports_bp
from routes.auth_routes import auth_bp
from routes.visitor_routes import visitor_bp
from routes.request_routes import request_bp
from routes.security_routes import security_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

@app.route("/")
def root():
    return jsonify({
        "message": "Visitor Management System API",
        "status": "running"
    })

# Serve uploaded images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)
    
@app.route('/uploads_users/<filename>')
def uploaded_user_file(filename):
    return send_from_directory('uploads_users', filename)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(visitor_bp)
app.register_blueprint(request_bp)
app.register_blueprint(security_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(admin_bp, url_prefix="/api")

if __name__ == "__main__":
    print("Backend running at http://localhost:5000")
    app.run(debug=True, port=5000)

