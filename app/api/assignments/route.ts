import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken, hasPermission } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(user.role, ["admin", "base_commander"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let query = `
      SELECT 
        a.*,
        ast.serial_number,
        et.name as equipment_name,
        u.full_name as assigned_by_name
      FROM assignments a
      JOIN assets ast ON a.asset_id = ast.id
      JOIN equipment_types et ON ast.equipment_type_id = et.id
      JOIN users u ON a.assigned_by = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    // Role-based filtering
    if (user.role !== "admin") {
      query += ` AND ast.base_id = $${paramIndex}`
      params.push(user.base_id)
      paramIndex++
    }

    query += " ORDER BY a.assignment_date DESC"

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Get assignments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(user.role, ["admin", "base_commander"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const { asset_id, assigned_to, assignment_date, purpose } = data

    // Check if asset exists and is available
    const assetResult = await pool.query("SELECT * FROM assets WHERE id = $1 AND status = $2", [asset_id, "available"])

    if (assetResult.rows.length === 0) {
      return NextResponse.json({ error: "Asset not found or not available" }, { status: 400 })
    }

    const asset = assetResult.rows[0]

    // Check base permissions
    if (user.role !== "admin" && asset.base_id !== user.base_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Start transaction
    await pool.query("BEGIN")

    try {
      // Create assignment
      const assignmentResult = await pool.query(
        `
        INSERT INTO assignments (
          asset_id, assigned_to, assigned_by, assignment_date, purpose
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [asset_id, assigned_to, user.id, assignment_date, purpose],
      )

      const assignment = assignmentResult.rows[0]

      // Update asset status
      await pool.query("UPDATE assets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        "assigned",
        asset_id,
      ])

      await pool.query("COMMIT")

      // Log audit event
      await logAuditEvent({
        user_id: user.id,
        action: "CREATE",
        table_name: "assignments",
        record_id: assignment.id,
        new_values: assignment,
        ip_address: request.ip,
        user_agent: request.headers.get("user-agent") || undefined,
      })

      return NextResponse.json(assignment, { status: 201 })
    } catch (error) {
      await pool.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
