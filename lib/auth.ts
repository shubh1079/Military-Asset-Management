import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import type { User } from "./models"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-must-be-at-least-32-characters-long",
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function generateToken(user: User): Promise<string> {
  return await new SignJWT({
    id: user._id?.toString(),
    username: user.username,
    role: user.role,
    base_id: user.base_id?.toString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(request: NextRequest): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

  if (!token) return null

  const decoded = await verifyToken(token)
  if (!decoded) return null

  try {
    const db = await getDatabase()
    const user = await db.users.findOne({ _id: new ObjectId(decoded.id) })
    return user as User | null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

export function canAccessBase(userRole: string, userBaseId: string | null, targetBaseId: string): boolean {
  if (userRole === "admin") return true
  if (userRole === "base_commander" || userRole === "logistics_officer") {
    return userBaseId === targetBaseId
  }
  return false
}
