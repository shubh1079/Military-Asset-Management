import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Find user
    const user = (await db.users.findOne({ username })) as User | null

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = await generateToken(user)

    // Log audit event
    await logAuditEvent({
      user_id: user._id!.toString(),
      action: "LOGIN",
      collection_name: "users",
      document_id: user._id!.toString(),
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    const response = NextResponse.json({
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        base_id: user.base_id?.toString() || null,
        full_name: user.full_name,
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
