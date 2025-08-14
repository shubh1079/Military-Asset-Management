// Mock database implementation for demo purposes
// In production, this would connect to a real database

interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role: string
  base_id: number | null
  full_name: string
  created_at: string
}

interface Base {
  id: number
  name: string
  location: string
  commander_id: number | null
}

interface EquipmentType {
  id: number
  name: string
  category: string
  unit: string
  description: string
}

interface Purchase {
  id: number
  base_id: number
  equipment_type_id: number
  quantity: number
  unit_cost: number
  total_cost: number
  supplier: string
  purchase_date: string
  purchase_order_number: string
  created_by: number
  created_at: string
}

interface Transfer {
  id: number
  from_base_id: number
  to_base_id: number
  equipment_type_id: number
  quantity: number
  transfer_date: string
  reason: string
  status: string
  requested_by: number
  approved_by: number | null
  created_at: string
}

interface Assignment {
  id: number
  asset_id: number
  assigned_to: string
  assigned_by: number
  assignment_date: string
  return_date: string | null
  purpose: string
  status: string
  created_at: string
}

interface Expenditure {
  id: number
  base_id: number
  equipment_type_id: number
  quantity: number
  expenditure_date: string
  reason: string
  operation_name: string
  recorded_by: number
  created_at: string
}

interface Asset {
  id: number
  equipment_type_id: number
  base_id: number
  serial_number: string
  status: string
  condition: string
  created_at: string
}

// Mock data store
const mockData = {
  users: [
    {
      id: 1,
      username: "admin",
      email: "admin@military.gov",
      password_hash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "admin",
      base_id: null,
      full_name: "System Administrator",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      username: "cmd_alpha",
      email: "commander.alpha@military.gov",
      password_hash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "base_commander",
      base_id: 1,
      full_name: "Colonel John Smith",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 3,
      username: "cmd_beta",
      email: "commander.beta@military.gov",
      password_hash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "base_commander",
      base_id: 2,
      full_name: "Colonel Jane Doe",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 4,
      username: "log_alpha",
      email: "logistics.alpha@military.gov",
      password_hash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "logistics_officer",
      base_id: 1,
      full_name: "Major Mike Johnson",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 5,
      username: "log_beta",
      email: "logistics.beta@military.gov",
      password_hash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "logistics_officer",
      base_id: 2,
      full_name: "Captain Sarah Wilson",
      created_at: "2024-01-01T00:00:00Z",
    },
  ] as User[],

  bases: [
    { id: 1, name: "Fort Alpha", location: "Northern Region", commander_id: 2 },
    { id: 2, name: "Base Beta", location: "Central Command", commander_id: 3 },
    { id: 3, name: "Outpost Gamma", location: "Southern Border", commander_id: null },
    { id: 4, name: "Naval Station Delta", location: "Coastal Area", commander_id: null },
  ] as Base[],

  equipmentTypes: [
    { id: 1, name: "M4A1 Carbine", category: "Weapons", unit: "each", description: "Standard issue assault rifle" },
    { id: 2, name: "M9 Pistol", category: "Weapons", unit: "each", description: "Standard issue sidearm" },
    {
      id: 3,
      name: "5.56mm Ammunition",
      category: "Ammunition",
      unit: "rounds",
      description: "5.56x45mm NATO ammunition",
    },
    { id: 4, name: "9mm Ammunition", category: "Ammunition", unit: "rounds", description: "9mm Parabellum ammunition" },
    {
      id: 5,
      name: "HMMWV",
      category: "Vehicles",
      unit: "each",
      description: "High Mobility Multipurpose Wheeled Vehicle",
    },
    { id: 6, name: "M1A2 Abrams", category: "Vehicles", unit: "each", description: "Main Battle Tank" },
    { id: 7, name: "Body Armor", category: "Equipment", unit: "each", description: "Interceptor Body Armor" },
    { id: 8, name: "Night Vision Goggles", category: "Equipment", unit: "each", description: "AN/PVS-14 Night Vision" },
    { id: 9, name: "Radio Set", category: "Communications", unit: "each", description: "AN/PRC-152 Tactical Radio" },
    { id: 10, name: "Medical Kit", category: "Medical", unit: "each", description: "Individual First Aid Kit" },
  ] as EquipmentType[],

  assets: [
    {
      id: 1,
      equipment_type_id: 1,
      base_id: 1,
      serial_number: "M4-001",
      status: "available",
      condition: "good",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      equipment_type_id: 1,
      base_id: 1,
      serial_number: "M4-002",
      status: "assigned",
      condition: "good",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 3,
      equipment_type_id: 2,
      base_id: 1,
      serial_number: "M9-001",
      status: "available",
      condition: "good",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 4,
      equipment_type_id: 5,
      base_id: 1,
      serial_number: "HMV-001",
      status: "available",
      condition: "good",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 5,
      equipment_type_id: 7,
      base_id: 1,
      serial_number: "BA-001",
      status: "assigned",
      condition: "good",
      created_at: "2024-01-01T00:00:00Z",
    },
  ] as Asset[],

  purchases: [
    {
      id: 1,
      base_id: 1,
      equipment_type_id: 1,
      quantity: 50,
      unit_cost: 1200.0,
      total_cost: 60000.0,
      supplier: "Defense Contractor A",
      purchase_date: "2024-01-15",
      purchase_order_number: "PO-2024-001",
      created_by: 4,
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      id: 2,
      base_id: 1,
      equipment_type_id: 3,
      quantity: 10000,
      unit_cost: 0.75,
      total_cost: 7500.0,
      supplier: "Ammunition Supplier B",
      purchase_date: "2024-01-20",
      purchase_order_number: "PO-2024-002",
      created_by: 4,
      created_at: "2024-01-20T00:00:00Z",
    },
    {
      id: 3,
      base_id: 2,
      equipment_type_id: 2,
      quantity: 25,
      unit_cost: 800.0,
      total_cost: 20000.0,
      supplier: "Defense Contractor A",
      purchase_date: "2024-02-01",
      purchase_order_number: "PO-2024-003",
      created_by: 5,
      created_at: "2024-02-01T00:00:00Z",
    },
  ] as Purchase[],

  transfers: [
    {
      id: 1,
      from_base_id: 1,
      to_base_id: 2,
      equipment_type_id: 1,
      quantity: 10,
      transfer_date: "2024-03-01",
      reason: "Operational requirement",
      status: "completed",
      requested_by: 4,
      approved_by: 2,
      created_at: "2024-03-01T00:00:00Z",
    },
    {
      id: 2,
      from_base_id: 2,
      to_base_id: 1,
      equipment_type_id: 3,
      quantity: 5000,
      transfer_date: "2024-03-05",
      reason: "Ammunition redistribution",
      status: "completed",
      requested_by: 5,
      approved_by: 3,
      created_at: "2024-03-05T00:00:00Z",
    },
    {
      id: 3,
      from_base_id: 1,
      to_base_id: 3,
      equipment_type_id: 7,
      quantity: 20,
      transfer_date: "2024-03-10",
      reason: "Training exercise support",
      status: "in_transit",
      requested_by: 4,
      approved_by: 2,
      created_at: "2024-03-10T00:00:00Z",
    },
  ] as Transfer[],

  assignments: [
    {
      id: 1,
      asset_id: 2,
      assigned_to: "Sergeant Williams",
      assigned_by: 4,
      assignment_date: "2024-01-25",
      return_date: null,
      purpose: "Patrol duty",
      status: "active",
      created_at: "2024-01-25T00:00:00Z",
    },
    {
      id: 2,
      asset_id: 5,
      assigned_to: "Corporal Davis",
      assigned_by: 4,
      assignment_date: "2024-02-01",
      return_date: null,
      purpose: "Training exercise",
      status: "active",
      created_at: "2024-02-01T00:00:00Z",
    },
  ] as Assignment[],

  expenditures: [
    {
      id: 1,
      base_id: 1,
      equipment_type_id: 3,
      quantity: 500,
      expenditure_date: "2024-02-20",
      reason: "Training exercise",
      operation_name: "Exercise Thunder",
      recorded_by: 4,
      created_at: "2024-02-20T00:00:00Z",
    },
    {
      id: 2,
      base_id: 2,
      equipment_type_id: 4,
      quantity: 200,
      expenditure_date: "2024-03-01",
      reason: "Qualification training",
      operation_name: "Marksmanship Training",
      recorded_by: 5,
      created_at: "2024-03-01T00:00:00Z",
    },
  ] as Expenditure[],

  auditLogs: [] as any[],
}

// Mock database interface
class MockDatabase {
  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    // Simple query parser for demo purposes
    const lowerText = text.toLowerCase().trim()

    if (lowerText.includes("select") && lowerText.includes("from users")) {
      if (lowerText.includes("where username")) {
        const username = params[0]
        const user = mockData.users.find((u) => u.username === username)
        return { rows: user ? [user] : [] }
      }
      if (lowerText.includes("where id")) {
        const id = params[0]
        const user = mockData.users.find((u) => u.id === id)
        return { rows: user ? [user] : [] }
      }
      return { rows: mockData.users }
    }

    if (lowerText.includes("select") && lowerText.includes("purchases")) {
      const purchases = mockData.purchases.map((p) => {
        const base = mockData.bases.find((b) => b.id === p.base_id)
        const equipment = mockData.equipmentTypes.find((e) => e.id === p.equipment_type_id)
        const user = mockData.users.find((u) => u.id === p.created_by)
        return {
          ...p,
          base_name: base?.name,
          equipment_name: equipment?.name,
          created_by_name: user?.full_name,
        }
      })
      return { rows: purchases }
    }

    if (lowerText.includes("select") && lowerText.includes("transfers")) {
      const transfers = mockData.transfers.map((t) => {
        const fromBase = mockData.bases.find((b) => b.id === t.from_base_id)
        const toBase = mockData.bases.find((b) => b.id === t.to_base_id)
        const equipment = mockData.equipmentTypes.find((e) => e.id === t.equipment_type_id)
        const requestedBy = mockData.users.find((u) => u.id === t.requested_by)
        const approvedBy = t.approved_by ? mockData.users.find((u) => u.id === t.approved_by) : null
        return {
          ...t,
          from_base_name: fromBase?.name,
          to_base_name: toBase?.name,
          equipment_name: equipment?.name,
          requested_by_name: requestedBy?.full_name,
          approved_by_name: approvedBy?.full_name,
        }
      })
      return { rows: transfers }
    }

    if (lowerText.includes("select") && lowerText.includes("assignments")) {
      const assignments = mockData.assignments.map((a) => {
        const asset = mockData.assets.find((ast) => ast.id === a.asset_id)
        const equipment = asset ? mockData.equipmentTypes.find((e) => e.id === asset.equipment_type_id) : null
        const assignedBy = mockData.users.find((u) => u.id === a.assigned_by)
        return {
          ...a,
          serial_number: asset?.serial_number,
          equipment_name: equipment?.name,
          assigned_by_name: assignedBy?.full_name,
        }
      })
      return { rows: assignments }
    }

    if (lowerText.includes("select") && lowerText.includes("expenditures")) {
      const expenditures = mockData.expenditures.map((e) => {
        const base = mockData.bases.find((b) => b.id === e.base_id)
        const equipment = mockData.equipmentTypes.find((eq) => eq.id === e.equipment_type_id)
        const recordedBy = mockData.users.find((u) => u.id === e.recorded_by)
        return {
          ...e,
          base_name: base?.name,
          equipment_name: equipment?.name,
          recorded_by_name: recordedBy?.full_name,
        }
      })
      return { rows: expenditures }
    }

    if (lowerText.includes("insert into purchases")) {
      const newPurchase = {
        id: mockData.purchases.length + 1,
        base_id: params[0],
        equipment_type_id: params[1],
        quantity: params[2],
        unit_cost: params[3],
        total_cost: params[4],
        supplier: params[5],
        purchase_date: params[6],
        purchase_order_number: params[7],
        created_by: params[8],
        created_at: new Date().toISOString(),
      }
      mockData.purchases.push(newPurchase)
      return { rows: [newPurchase] }
    }

    if (lowerText.includes("insert into transfers")) {
      const newTransfer = {
        id: mockData.transfers.length + 1,
        from_base_id: params[0],
        to_base_id: params[1],
        equipment_type_id: params[2],
        quantity: params[3],
        transfer_date: params[4],
        reason: params[5],
        status: "pending",
        requested_by: params[6],
        approved_by: null,
        created_at: new Date().toISOString(),
      }
      mockData.transfers.push(newTransfer)
      return { rows: [newTransfer] }
    }

    if (lowerText.includes("insert into assignments")) {
      const newAssignment = {
        id: mockData.assignments.length + 1,
        asset_id: params[0],
        assigned_to: params[1],
        assigned_by: params[2],
        assignment_date: params[3],
        return_date: null,
        purpose: params[4],
        status: "active",
        created_at: new Date().toISOString(),
      }
      mockData.assignments.push(newAssignment)
      return { rows: [newAssignment] }
    }

    if (lowerText.includes("insert into expenditures")) {
      const newExpenditure = {
        id: mockData.expenditures.length + 1,
        base_id: params[0],
        equipment_type_id: params[1],
        quantity: params[2],
        expenditure_date: params[3],
        reason: params[4],
        operation_name: params[5],
        recorded_by: params[6],
        created_at: new Date().toISOString(),
      }
      mockData.expenditures.push(newExpenditure)
      return { rows: [newExpenditure] }
    }

    if (lowerText.includes("insert into audit_logs")) {
      const newLog = {
        id: mockData.auditLogs.length + 1,
        user_id: params[0],
        action: params[1],
        table_name: params[2],
        record_id: params[3],
        old_values: params[4],
        new_values: params[5],
        ip_address: params[6],
        user_agent: params[7],
        created_at: new Date().toISOString(),
      }
      mockData.auditLogs.push(newLog)
      return { rows: [newLog] }
    }

    // Default empty response
    return { rows: [] }
  }
}

const pool = new MockDatabase()

export default pool
