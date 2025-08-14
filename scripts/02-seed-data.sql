-- Seed data for Military Asset Management System

-- Insert bases
INSERT INTO bases (name, location) VALUES
('Fort Alpha', 'Northern Region'),
('Base Beta', 'Central Command'),
('Outpost Gamma', 'Southern Border'),
('Naval Station Delta', 'Coastal Area');

-- Insert equipment types
INSERT INTO equipment_types (name, category, unit, description) VALUES
('M4A1 Carbine', 'Weapons', 'each', 'Standard issue assault rifle'),
('M9 Pistol', 'Weapons', 'each', 'Standard issue sidearm'),
('5.56mm Ammunition', 'Ammunition', 'rounds', '5.56x45mm NATO ammunition'),
('9mm Ammunition', 'Ammunition', 'rounds', '9mm Parabellum ammunition'),
('HMMWV', 'Vehicles', 'each', 'High Mobility Multipurpose Wheeled Vehicle'),
('M1A2 Abrams', 'Vehicles', 'each', 'Main Battle Tank'),
('Body Armor', 'Equipment', 'each', 'Interceptor Body Armor'),
('Night Vision Goggles', 'Equipment', 'each', 'AN/PVS-14 Night Vision'),
('Radio Set', 'Communications', 'each', 'AN/PRC-152 Tactical Radio'),
('Medical Kit', 'Medical', 'each', 'Individual First Aid Kit');

-- Insert users with bcrypt hashed passwords (password: "password")
INSERT INTO users (username, email, password_hash, role, base_id, full_name) VALUES
('admin', 'admin@military.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 'System Administrator'),
('cmd_alpha', 'commander.alpha@military.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'base_commander', 1, 'Colonel John Smith'),
('cmd_beta', 'commander.beta@military.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'base_commander', 2, 'Colonel Jane Doe'),
('log_alpha', 'logistics.alpha@military.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'logistics_officer', 1, 'Major Mike Johnson'),
('log_beta', 'logistics.beta@military.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'logistics_officer', 2, 'Captain Sarah Wilson');

-- Update base commanders
UPDATE bases SET commander_id = 2 WHERE id = 1;
UPDATE bases SET commander_id = 3 WHERE id = 2;

-- Insert sample assets
INSERT INTO assets (equipment_type_id, base_id, serial_number, status) VALUES
(1, 1, 'M4-001', 'available'),
(1, 1, 'M4-002', 'assigned'),
(2, 1, 'M9-001', 'available'),
(5, 1, 'HMV-001', 'available'),
(7, 1, 'BA-001', 'assigned'),
(1, 2, 'M4-101', 'available'),
(2, 2, 'M9-101', 'available'),
(5, 2, 'HMV-101', 'maintenance');

-- Insert sample purchases
INSERT INTO purchases (base_id, equipment_type_id, quantity, unit_cost, total_cost, supplier, purchase_date, purchase_order_number, created_by) VALUES
(1, 1, 50, 1200.00, 60000.00, 'Defense Contractor A', '2024-01-15', 'PO-2024-001', 4),
(1, 3, 10000, 0.75, 7500.00, 'Ammunition Supplier B', '2024-01-20', 'PO-2024-002', 4),
(2, 2, 25, 800.00, 20000.00, 'Defense Contractor A', '2024-02-01', 'PO-2024-003', 5),
(2, 5, 5, 150000.00, 750000.00, 'Vehicle Manufacturer C', '2024-02-15', 'PO-2024-004', 5);

-- Insert sample transfers
INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, reason, status, requested_by, approved_by) VALUES
(1, 2, 1, 10, '2024-03-01', 'Operational requirement', 'completed', 4, 2),
(2, 1, 3, 5000, '2024-03-05', 'Ammunition redistribution', 'completed', 5, 3),
(1, 3, 7, 20, '2024-03-10', 'Training exercise support', 'in_transit', 4, 2);

-- Insert sample assignments
INSERT INTO assignments (asset_id, assigned_to, assigned_by, assignment_date, purpose, status) VALUES
(2, 'Sergeant Williams', 4, '2024-01-25', 'Patrol duty', 'active'),
(5, 'Corporal Davis', 4, '2024-02-01', 'Training exercise', 'active');

-- Insert sample expenditures
INSERT INTO expenditures (base_id, equipment_type_id, quantity, expenditure_date, reason, operation_name, recorded_by) VALUES
(1, 3, 500, '2024-02-20', 'Training exercise', 'Exercise Thunder', 4),
(2, 4, 200, '2024-03-01', 'Qualification training', 'Marksmanship Training', 5),
(1, 3, 1000, '2024-03-15', 'Combat operations', 'Operation Shield', 4);
