import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { ObjectId } from "mongodb"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, role, baseId } = await request.json()

    // Validation
    if (!username || !email || !password || !fullName || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
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
    const userId = result.insertedId

    // Generate token
    const userWithId = { ...newUser, _id: userId }
    const token = await generateToken(userWithId as User)

    // Log audit event
    await logAuditEvent({
      user_id: userId.toString(),
      action: "USER_CREATED",
      collection_name: "users",
      document_id: userId.toString(),
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    const response = NextResponse.json({
      message: "User created successfully",
      user: {
        id: userId.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        base_id: newUser.base_id?.toString() || null,
        full_name: newUser.full_name,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
