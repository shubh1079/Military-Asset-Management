import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    const equipmentTypes = await db.equipmentTypes.find({}).toArray()
    
    return NextResponse.json({
      equipment_types: equipmentTypes.map(equipment => ({
        id: equipment._id.toString(),
        name: equipment.name,
        category: equipment.category,
        unit: equipment.unit,
        description: equipment.description
      }))
    })
  } catch (error) {
    console.error("Error fetching equipment types:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
