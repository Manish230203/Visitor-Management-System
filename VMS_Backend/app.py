from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import uuid
import pymysql

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'vms_database',
    'charset': 'utf8mb4'
}

# Secret key for JWT token generation
SECRET_KEY = "vms_secret_key_2026"

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except pymysql.err.OperationalError as e:
        print(f"Database connection error: {e}")
        return None

def init_database():
    """Initialize database tables if they don't exist"""
    # First connect without database to create it
    temp_config = DB_CONFIG.copy()
    temp_config.pop('database', None)
    
    try:
        conn = pymysql.connect(**temp_config)
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS vms_database")
        conn.close()
        
        # Now connect to the database and create tables
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(36) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'host', 'security') DEFAULT 'host',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create visitors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                visitor_id VARCHAR(36) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                host_id VARCHAR(36),
                host_name VARCHAR(255),
                purpose TEXT,
                check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
                check_out DATETIME NULL,
                status ENUM('checked_in', 'checked_out', 'cancelled') DEFAULT 'checked_in',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default users if not exist
        cursor.execute("SELECT * FROM users WHERE email = 'admin@vms.com'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (user_id, name, email, password, role) 
                VALUES ('admin001', 'Admin User', 'admin@vms.com', 'admin123', 'admin')
            """)
        
        cursor.execute("SELECT * FROM users WHERE email = 'host@vms.com'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (user_id, name, email, password, role) 
                VALUES ('host001', 'Host User', 'host@vms.com', 'host123', 'host')
            """)
            
        cursor.execute("SELECT * FROM users WHERE email = 'security@vms.com'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (user_id, name, email, password, role) 
                VALUES ('security001', 'Security User', 'security@vms.com', 'security123', 'security')
            """)
        
        conn.commit()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Generate a unique ID
def generate_id():
    return str(uuid.uuid4())[:8]

# Root route to check if server is running
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Visitor Management System API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': {
                'login': 'POST /api/auth/login',
                'register': 'POST /api/auth/register'
            },
            'visitors': {
                'get_all': 'GET /api/visitors',
                'create': 'POST /api/visitors',
                'update': 'PUT /api/visitors/<id>',
                'checkout': 'POST /api/visitors/<id>/checkout'
            },
            'stats': 'GET /api/stats'
        },
        'demo_accounts': {
            'admin': 'admin@vms.com / admin123',
            'host': 'host@vms.com / host123',
            'security': 'security@vms.com / security123'
        }
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (data.get('email'),))
        if cursor.fetchone():
            return jsonify({'message': 'User already exists'}), 400
        
        # Create new user
        new_user_id = generate_id()
        cursor.execute("""
            INSERT INTO users (user_id, name, email, password, role) 
            VALUES (%s, %s, %s, %s, %s)
        """, (new_user_id, data.get('name'), data.get('email'), data.get('password'), 'host'))
        
        conn.commit()
        
        # Generate token
        token = jwt.encode({
            'user_id': new_user_id,
            'email': data.get('email'),
            'role': 'host',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': new_user_id,
                'name': data.get('name'),
                'email': data.get('email'),
                'role': 'host'
            }
        }), 201
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Find user by email and password
        cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", 
                     (data.get('email'), data.get('password')))
        user = cursor.fetchone()
        
        # If not found in database, check demo accounts
        if not user:
            demo_accounts = {
                'admin@vms.com': {'id': 'admin001', 'name': 'Admin User', 'role': 'admin'},
                'host@vms.com': {'id': 'host001', 'name': 'Host User', 'role': 'host'},
                'security@vms.com': {'id': 'security001', 'name': 'Security User', 'role': 'security'}
            }
            
            if data.get('email') in demo_accounts and data.get('password') in ['admin123', 'host123', 'security123']:
                user = demo_accounts[data.get('email')]
                user['email'] = data.get('email')
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        token = jwt.encode({
            'user_id': user['id'] if 'id' in user else user['user_id'],
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'] if 'id' in user else user['user_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500
    finally:
        conn.close()

# Visitor endpoints
@app.route('/api/visitors', methods=['GET'])
def get_visitors():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'No token provided'}), 401
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM visitors ORDER BY check_in DESC")
        visitors = cursor.fetchall()
        
        # Convert datetime objects to strings
        for visitor in visitors:
            if visitor.get('check_in'):
                visitor['check_in'] = visitor['check_in'].isoformat()
            if visitor.get('check_out'):
                visitor['check_out'] = visitor['check_out'].isoformat()
            if visitor.get('created_at'):
                visitor['created_at'] = visitor['created_at'].isoformat()
            if visitor.get('updated_at'):
                visitor['updated_at'] = visitor['updated_at'].isoformat()
        
        return jsonify(visitors), 200
    except Exception as e:
        return jsonify({'message': f'Failed to get visitors: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/visitors', methods=['POST'])
def create_visitor():
    data = request.get_json()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        new_visitor_id = generate_id()
        cursor.execute("""
            INSERT INTO visitors (visitor_id, name, email, phone, host_id, host_name, purpose, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'checked_in')
        """, (new_visitor_id, data.get('name'), data.get('email'), data.get('phone'), 
              data.get('host_id'), data.get('host'), data.get('purpose')))
        
        conn.commit()
        
        # Get the created visitor
        cursor.execute("SELECT * FROM visitors WHERE visitor_id = %s", (new_visitor_id,))
        visitor = cursor.fetchone()
        
        # Convert datetime to string
        if visitor.get('check_in'):
            visitor['check_in'] = visitor['check_in'].isoformat()
        
        return jsonify(visitor), 201
    except Exception as e:
        return jsonify({'message': f'Failed to create visitor: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/visitors/<visitor_id>', methods=['PUT'])
def update_visitor(visitor_id):
    data = request.get_json()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Build update query
        update_fields = []
        values = []
        for key in ['name', 'email', 'phone', 'host', 'host_name', 'purpose', 'status']:
            if key in data:
                if key == 'host':
                    update_fields.append('host_name = %s')
                    values.append(data[key])
                elif key == 'host_name':
                    continue  # Skip, handled by host
                else:
                    update_fields.append(f'{key} = %s')
                    values.append(data[key])
        
        if update_fields:
            values.append(visitor_id)
            query = f"UPDATE visitors SET {', '.join(update_fields)} WHERE visitor_id = %s"
            cursor.execute(query, values)
            conn.commit()
        
        cursor.execute("SELECT * FROM visitors WHERE visitor_id = %s", (visitor_id,))
        visitor = cursor.fetchone()
        
        if not visitor:
            return jsonify({'message': 'Visitor not found'}), 404
        
        # Convert datetime to string
        if visitor.get('check_in'):
            visitor['check_in'] = visitor['check_in'].isoformat()
        if visitor.get('check_out'):
            visitor['check_out'] = visitor['check_out'].isoformat()
        
        return jsonify(visitor), 200
    except Exception as e:
        return jsonify({'message': f'Failed to update visitor: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/visitors/<visitor_id>/checkout', methods=['POST'])
def checkout_visitor(visitor_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        cursor.execute("""
            UPDATE visitors 
            SET check_out = NOW(), status = 'checked_out' 
            WHERE visitor_id = %s
        """, (visitor_id,))
        
        conn.commit()
        
        cursor.execute("SELECT * FROM visitors WHERE visitor_id = %s", (visitor_id,))
        visitor = cursor.fetchone()
        
        if not visitor:
            return jsonify({'message': 'Visitor not found'}), 404
        
        # Convert datetime to string
        if visitor.get('check_in'):
            visitor['check_in'] = visitor['check_in'].isoformat()
        if visitor.get('check_out'):
            visitor['check_out'] = visitor['check_out'].isoformat()
        
        return jsonify(visitor), 200
    except Exception as e:
        return jsonify({'message': f'Failed to checkout visitor: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        cursor.execute("SELECT COUNT(*) as total FROM visitors")
        total = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as checked_in FROM visitors WHERE status = 'checked_in'")
        checked_in = cursor.fetchone()['checked_in']
        
        cursor.execute("SELECT COUNT(*) as checked_out FROM visitors WHERE status = 'checked_out'")
        checked_out = cursor.fetchone()['checked_out']
        
        return jsonify({
            'total': total,
            'checked_in': checked_in,
            'checked_out': checked_out
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to get stats: {str(e)}'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    print("Starting Visitor Management System Backend...")
    print("Initializing database...")
    init_database()
    print("Server running at http://localhost:8000")
    app.run(debug=True, port=8000)
