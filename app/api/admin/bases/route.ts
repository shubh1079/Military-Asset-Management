import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, location, commanderId } = await request.json()

    // Validation
    if (!name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if base name already exists
    const existingBase = await db.bases.findOne({ name })
    if (existingBase) {
      return NextResponse.json({ error: "Base name already exists" }, { status: 409 })
    }

    // Validate commander if provided
    let commanderObjectId = null
    if (commanderId) {
      try {
        commanderObjectId = new ObjectId(commanderId)
        const commander = await db.users.findOne({ 
          _id: commanderObjectId, 
          role: "base_commander" 
        })
        if (!commander) {
          return NextResponse.json({ error: "Invalid commander ID or user is not a base commander" }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid commander ID format" }, { status: 400 })
      }
    }

    // Create base
    const newBase = {
      name,
      location,
      commander_id: commanderObjectId,
      created_at: new Date(),
    }

    const result = await db.bases.insertOne(newBase)

    // Log audit event
    await logAuditEvent({
      user_id: user._id!.toString(),
      action: "BASE_CREATED",
      collection_name: "bases",
      document_id: result.insertedId.toString(),
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({
      message: "Base created successfully",
      base: {
        id: result.insertedId.toString(),
        name: newBase.name,
        location: newBase.location,
      },
    })
  } catch (error) {
    console.error("Create base error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
