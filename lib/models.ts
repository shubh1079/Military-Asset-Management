import type { ObjectId } from "mongodb"

// User model
export interface User {
  _id?: ObjectId
  username: string
  email: string
  password_hash: string
  role: "admin" | "base_commander" | "logistics_officer"
  base_id?: ObjectId | null
  full_name: string
  created_at: Date
  updated_at: Date
}

// Base model
export interface Base {
  _id?: ObjectId
  name: string
  location: string
  commander_id?: ObjectId | null
  created_at: Date
}

// Equipment Type model
export interface EquipmentType {
  _id?: ObjectId
  name: string
  category: string
  unit: string
  description: string
  created_at: Date
}

// Asset model
export interface Asset {
  _id?: ObjectId
  equipment_type_id: ObjectId
  base_id: ObjectId
  serial_number: string
  status: "available" | "assigned" | "maintenance" | "expended"
  condition: "excellent" | "good" | "fair" | "poor"
  metadata?: {
    manufacturer?: string
    model?: string
    year?: number
    specifications?: Record<string, any>
  }
  created_at: Date
  updated_at: Date
}

// Purchase model
export interface Purchase {
  _id?: ObjectId
  base_id: ObjectId
  equipment_type_id: ObjectId
  quantity: number
  unit_cost: number
  total_cost: number
  supplier: string
  purchase_date: Date
  purchase_order_number: string
  created_by: ObjectId
  metadata?: {
    delivery_date?: Date
    warranty_info?: string
    contract_details?: Record<string, any>
  }
  created_at: Date
}

// Transfer model
export interface Transfer {
  _id?: ObjectId
  from_base_id: ObjectId
  to_base_id: ObjectId
  equipment_type_id: ObjectId
  quantity: number
  transfer_date: Date
  reason: string
  status: "pending" | "in_transit" | "completed" | "cancelled"
  requested_by: ObjectId
  approved_by?: ObjectId | null
  tracking_info?: {
    transport_method?: string
    estimated_arrival?: Date
    actual_arrival?: Date
    tracking_number?: string
  }
  created_at: Date
  completed_at?: Date
}

// Assignment model
export interface Assignment {
  _id?: ObjectId
  asset_id: ObjectId
  assigned_to: string
  assigned_by: ObjectId
  assignment_date: Date
  return_date?: Date | null
  purpose: string
  status: "active" | "returned" | "lost" | "damaged"
  location?: string
  notes?: string
  created_at: Date
}

// Expenditure model
export interface Expenditure {
  _id?: ObjectId
  base_id: ObjectId
  equipment_type_id: ObjectId
  quantity: number
  expenditure_date: Date
  reason: string
  operation_name?: string
  recorded_by: ObjectId
  expenditure_type: "training" | "operations" | "maintenance" | "loss"
  metadata?: {
    mission_id?: string
    cost_center?: string
    authorization_code?: string
  }
  created_at: Date
}

// Audit Log model
export interface AuditLog {
  _id?: ObjectId
  user_id: ObjectId
  action: string
  collection_name: string
  document_id?: ObjectId
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  created_at: Date
}

// Dashboard metrics interface
export interface DashboardMetrics {
  opening_balance: number
  closing_balance: number
  net_movement: number
  purchases: number
  transfers_in: number
  transfers_out: number
  assignments: number
  expenditures: number
  breakdown: {
    purchases: Array<{ equipment_name: string; quantity: number }>
    transfers_in: Array<{ equipment_name: string; quantity: number }>
    transfers_out: Array<{ equipment_name: string; quantity: number }>
  }
}
