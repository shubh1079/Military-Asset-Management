-- Military Asset Management System Database Schema

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'base_commander', 'logistics_officer')),
    base_id INTEGER,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bases table
CREATE TABLE IF NOT EXISTS bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    commander_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment types
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets inventory
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    equipment_type_id INTEGER NOT NULL,
    base_id INTEGER NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'expended')),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (base_id) REFERENCES bases(id)
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL,
    equipment_type_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    supplier VARCHAR(100),
    purchase_date DATE NOT NULL,
    purchase_order_number VARCHAR(50),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Transfers
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    from_base_id INTEGER NOT NULL,
    to_base_id INTEGER NOT NULL,
    equipment_type_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    transfer_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
    requested_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (from_base_id) REFERENCES bases(id),
    FOREIGN KEY (to_base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL,
    assigned_to VARCHAR(100) NOT NULL,
    assigned_by INTEGER NOT NULL,
    assignment_date DATE NOT NULL,
    return_date DATE,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'lost', 'damaged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Expenditures
CREATE TABLE IF NOT EXISTS expenditures (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL,
    equipment_type_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    expenditure_date DATE NOT NULL,
    reason TEXT NOT NULL,
    operation_name VARCHAR(100),
    recorded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Audit log for all transactions
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_base FOREIGN KEY (base_id) REFERENCES bases(id);
ALTER TABLE bases ADD CONSTRAINT fk_bases_commander FOREIGN KEY (commander_id) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_assets_base_equipment ON assets(base_id, equipment_type_id);
CREATE INDEX idx_purchases_base_date ON purchases(base_id, purchase_date);
CREATE INDEX idx_transfers_bases_date ON transfers(from_base_id, to_base_id, transfer_date);
CREATE INDEX idx_assignments_asset_status ON assignments(asset_id, status);
CREATE INDEX idx_expenditures_base_date ON expenditures(base_id, expenditure_date);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);
