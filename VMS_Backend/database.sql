-- Visitor Management System Database
-- Create database
CREATE DATABASE IF NOT EXISTS vms_database;
USE vms_database;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'host', 'security') DEFAULT 'host',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Visitors table for visitor management
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
);

-- Insert default admin user (password: admin123 - in production, hash this!)
INSERT INTO users (user_id, name, email, password, role) 
VALUES ('admin001', 'Admin User', 'admin@vms.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- Insert default host user
INSERT INTO users (user_id, name, email, password, role) 
VALUES ('host001', 'Host User', 'host@vms.com', 'host123', 'host')
ON DUPLICATE KEY UPDATE name = name;

-- Insert default security user
INSERT INTO users (user_id, name, email, password, role) 
VALUES ('security001', 'Security User', 'security@vms.com', 'security123', 'security')
ON DUPLICATE KEY UPDATE name = name;
