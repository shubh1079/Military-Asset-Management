import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get counts
    const [totalUsers, totalBases, totalAssets, activeTransfers, pendingApprovals] = await Promise.all([
      db.users.countDocuments(),
      db.bases.countDocuments(),
      db.assets.countDocuments(),
      db.transfers.countDocuments({ status: { $in: ["pending", "in_transit"] } }),
      db.transfers.countDocuments({ status: "pending" })
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentActivity = await db.auditLogs.countDocuments({
      created_at: { $gte: sevenDaysAgo }
    })

    return NextResponse.json({
      totalUsers,
      totalBases,
      totalAssets,
      activeTransfers,
      pendingApprovals,
      recentActivity
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
