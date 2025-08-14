import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    
    const users = await db.users.aggregate([
      {
        $lookup: {
          from: "bases",
          localField: "base_id",
          foreignField: "_id",
          as: "base"
        }
      },
      {
        $project: {
          id: { $toString: "$_id" },
          username: 1,
          email: 1,
          role: 1,
          full_name: 1,
          base_id: { $toString: "$base_id" },
          base_name: { $arrayElemAt: ["$base.name", 0] },
          created_at: 1,
          updated_at: 1
        }
      },
      { $sort: { created_at: -1 } }
    ]).toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, password, fullName, role, baseId } = await request.json()

    // Validation
    if (!username || !email || !password || !fullName || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if username already exists
    const existingUser = await db.users.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Check if email already exists
    const existingEmail = await db.users.findOne({ email })
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Validate role
    const validRoles = ["admin", "base_commander", "logistics_officer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Validate base_id if provided
    let baseObjectId = null
    if (baseId && role !== "admin") {
      try {
        baseObjectId = new ObjectId(baseId)
        const base = await db.bases.findOne({ _id: baseObjectId })
        if (!base) {
          return NextResponse.json({ error: "Invalid base ID" }, { status: 400 })
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid base ID format" }, { status: 400 })
      }
    }

    // Create user
    const newUser = {
      username,
      email,
      password_hash: passwordHash,
      role,
      base_id: baseObjectId,
      full_name: fullName,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.users.insertOne(newUser)

    // Log audit event
    await logAuditEvent({
      user_id: user._id!.toString(),
      action: "USER_CREATED",
      collection_name: "users",
      document_id: result.insertedId.toString(),
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.insertedId.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
