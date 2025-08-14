import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (user) {
      await logAuditEvent({
        user_id: user.id,
        action: "LOGOUT",
        table_name: "users",
        record_id: user.id,
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent") || undefined,
      })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
