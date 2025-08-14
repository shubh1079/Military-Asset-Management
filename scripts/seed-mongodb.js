// MongoDB seed script
// Run with: node scripts/seed-mongodb.js

import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shubham"
const DB_NAME = "military_assets"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Clear existing collections
    const collections = [
      "users",
      "bases",
      "equipment_types",
      "assets",
      "purchases",
      "transfers",
      "assignments",
      "expenditures",
    ]

    for (const collectionName of collections) {
      await db.collection(collectionName).deleteMany({})
      console.log(`Cleared ${collectionName} collection`)
    }

    // Create indexes
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("assets").createIndex({ base_id: 1, equipment_type_id: 1 })
    await db.collection("purchases").createIndex({ base_id: 1, purchase_date: -1 })
    await db.collection("transfers").createIndex({ from_base_id: 1, to_base_id: 1, transfer_date: -1 })
    await db.collection("assignments").createIndex({ asset_id: 1, status: 1 })
    await db.collection("expenditures").createIndex({ base_id: 1, expenditure_date: -1 })
    await db.collection("audit_logs").createIndex({ user_id: 1, created_at: -1 })

    // Hash password for demo accounts
    const hashedPassword = await bcrypt.hash("password", 10)

    // Insert bases
    const basesResult = await db.collection("bases").insertMany([
      {
        name: "Fort Alpha",
        location: "Northern Region",
        created_at: new Date(),
      },
      {
        name: "Base Beta",
        location: "Central Command",
        created_at: new Date(),
      },
      {
        name: "Outpost Gamma",
        location: "Southern Border",
        created_at: new Date(),
      },
      {
        name: "Naval Station Delta",
        location: "Coastal Area",
        created_at: new Date(),
      },
    ])

    const baseIds = Object.values(basesResult.insertedIds)
    console.log("Inserted bases")

    // Insert users
    const usersResult = await db.collection("users").insertMany([
      {
        username: "admin",
        email: "admin@military.gov",
        password_hash: hashedPassword,
        role: "admin",
        base_id: null,
        full_name: "System Administrator",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: "cmd_alpha",
        email: "commander.alpha@military.gov",
        password_hash: hashedPassword,
        role: "base_commander",
        base_id: baseIds[0],
        full_name: "Colonel John Smith",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: "cmd_beta",
        email: "commander.beta@military.gov",
        password_hash: hashedPassword,
        role: "base_commander",
        base_id: baseIds[1],
        full_name: "Colonel Jane Doe",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: "log_alpha",
        email: "logistics.alpha@military.gov",
        password_hash: hashedPassword,
        role: "logistics_officer",
        base_id: baseIds[0],
        full_name: "Major Mike Johnson",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: "log_beta",
        email: "logistics.beta@military.gov",
        password_hash: hashedPassword,
        role: "logistics_officer",
        base_id: baseIds[1],
        full_name: "Captain Sarah Wilson",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    const userIds = Object.values(usersResult.insertedIds)
    console.log("Inserted users")

    // Update base commanders
    await db.collection("bases").updateOne({ _id: baseIds[0] }, { $set: { commander_id: userIds[1] } })
    await db.collection("bases").updateOne({ _id: baseIds[1] }, { $set: { commander_id: userIds[2] } })

    // Insert equipment types
    const equipmentResult = await db.collection("equipment_types").insertMany([
      {
        name: "M4A1 Carbine",
        category: "Weapons",
        unit: "each",
        description: "Standard issue assault rifle",
        created_at: new Date(),
      },
      {
        name: "M9 Pistol",
        category: "Weapons",
        unit: "each",
        description: "Standard issue sidearm",
        created_at: new Date(),
      },
      {
        name: "5.56mm Ammunition",
        category: "Ammunition",
        unit: "rounds",
        description: "5.56x45mm NATO ammunition",
        created_at: new Date(),
      },
      {
        name: "9mm Ammunition",
        category: "Ammunition",
        unit: "rounds",
        description: "9mm Parabellum ammunition",
        created_at: new Date(),
      },
      {
        name: "HMMWV",
        category: "Vehicles",
        unit: "each",
        description: "High Mobility Multipurpose Wheeled Vehicle",
        created_at: new Date(),
      },
      {
        name: "M1A2 Abrams",
        category: "Vehicles",
        unit: "each",
        description: "Main Battle Tank",
        created_at: new Date(),
      },
      {
        name: "Body Armor",
        category: "Equipment",
        unit: "each",
        description: "Interceptor Body Armor",
        created_at: new Date(),
      },
      {
        name: "Night Vision Goggles",
        category: "Equipment",
        unit: "each",
        description: "AN/PVS-14 Night Vision",
        created_at: new Date(),
      },
      {
        name: "Radio Set",
        category: "Communications",
        unit: "each",
        description: "AN/PRC-152 Tactical Radio",
        created_at: new Date(),
      },
      {
        name: "Medical Kit",
        category: "Medical",
        unit: "each",
        description: "Individual First Aid Kit",
        created_at: new Date(),
      },
    ])

    const equipmentIds = Object.values(equipmentResult.insertedIds)
    console.log("Inserted equipment types")

    // Insert sample assets
    await db.collection("assets").insertMany([
      {
        equipment_type_id: equipmentIds[0],
        base_id: baseIds[0],
        serial_number: "M4-001",
        status: "available",
        condition: "good",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        equipment_type_id: equipmentIds[0],
        base_id: baseIds[0],
        serial_number: "M4-002",
        status: "assigned",
        condition: "good",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        equipment_type_id: equipmentIds[1],
        base_id: baseIds[0],
        serial_number: "M9-001",
        status: "available",
        condition: "good",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        equipment_type_id: equipmentIds[4],
        base_id: baseIds[0],
        serial_number: "HMV-001",
        status: "available",
        condition: "good",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        equipment_type_id: equipmentIds[6],
        base_id: baseIds[0],
        serial_number: "BA-001",
        status: "assigned",
        condition: "good",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    console.log("Inserted sample assets")

    // Insert sample purchases
    await db.collection("purchases").insertMany([
      {
        base_id: baseIds[0],
        equipment_type_id: equipmentIds[0],
        quantity: 50,
        unit_cost: 1200.0,
        total_cost: 60000.0,
        supplier: "Defense Contractor A",
        purchase_date: new Date("2024-01-15"),
        purchase_order_number: "PO-2024-001",
        created_by: userIds[3],
        created_at: new Date("2024-01-15"),
      },
      {
        base_id: baseIds[0],
        equipment_type_id: equipmentIds[2],
        quantity: 10000,
        unit_cost: 0.75,
        total_cost: 7500.0,
        supplier: "Ammunition Supplier B",
        purchase_date: new Date("2024-01-20"),
        purchase_order_number: "PO-2024-002",
        created_by: userIds[3],
        created_at: new Date("2024-01-20"),
      },
      {
        base_id: baseIds[1],
        equipment_type_id: equipmentIds[1],
        quantity: 25,
        unit_cost: 800.0,
        total_cost: 20000.0,
        supplier: "Defense Contractor A",
        purchase_date: new Date("2024-02-01"),
        purchase_order_number: "PO-2024-003",
        created_by: userIds[4],
        created_at: new Date("2024-02-01"),
      },
    ])

    console.log("Inserted sample purchases")

    // Insert sample transfers
    await db.collection("transfers").insertMany([
      {
        from_base_id: baseIds[0],
        to_base_id: baseIds[1],
        equipment_type_id: equipmentIds[0],
        quantity: 10,
        transfer_date: new Date("2024-03-01"),
        reason: "Operational requirement",
        status: "completed",
        requested_by: userIds[3],
        approved_by: userIds[1],
        created_at: new Date("2024-03-01"),
        completed_at: new Date("2024-03-03"),
      },
      {
        from_base_id: baseIds[1],
        to_base_id: baseIds[0],
        equipment_type_id: equipmentIds[2],
        quantity: 5000,
        transfer_date: new Date("2024-03-05"),
        reason: "Ammunition redistribution",
        status: "completed",
        requested_by: userIds[4],
        approved_by: userIds[2],
        created_at: new Date("2024-03-05"),
        completed_at: new Date("2024-03-07"),
      },
      {
        from_base_id: baseIds[0],
        to_base_id: baseIds[2],
        equipment_type_id: equipmentIds[6],
        quantity: 20,
        transfer_date: new Date("2024-03-10"),
        reason: "Training exercise support",
        status: "in_transit",
        requested_by: userIds[3],
        approved_by: userIds[1],
        created_at: new Date("2024-03-10"),
      },
    ])

    console.log("Inserted sample transfers")

    // Insert sample expenditures
    await db.collection("expenditures").insertMany([
      {
        base_id: baseIds[0],
        equipment_type_id: equipmentIds[2],
        quantity: 500,
        expenditure_date: new Date("2024-02-20"),
        reason: "Training exercise",
        operation_name: "Exercise Thunder",
        expenditure_type: "training",
        recorded_by: userIds[3],
        created_at: new Date("2024-02-20"),
      },
      {
        base_id: baseIds[1],
        equipment_type_id: equipmentIds[3],
        quantity: 200,
        expenditure_date: new Date("2024-03-01"),
        reason: "Qualification training",
        operation_name: "Marksmanship Training",
        expenditure_type: "training",
        recorded_by: userIds[4],
        created_at: new Date("2024-03-01"),
      },
      {
        base_id: baseIds[0],
        equipment_type_id: equipmentIds[2],
        quantity: 1000,
        expenditure_date: new Date("2024-03-15"),
        reason: "Combat operations",
        operation_name: "Operation Shield",
        expenditure_type: "operations",
        recorded_by: userIds[3],
        created_at: new Date("2024-03-15"),
      },
    ])

    console.log("Inserted sample expenditures")

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
