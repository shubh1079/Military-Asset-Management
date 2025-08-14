import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    const bases = await db.bases.find({}).toArray()
    
    return NextResponse.json({
      bases: bases.map(base => ({
        id: base._id.toString(),
        name: base.name,
        location: base.location
      }))
    })
  } catch (error) {
    console.error("Error fetching bases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
