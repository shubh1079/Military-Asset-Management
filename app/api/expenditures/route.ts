import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken, canAccessBase } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = `
      SELECT 
        e.*,
        b.name as base_name,
        et.name as equipment_name,
        u.full_name as recorded_by_name
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      JOIN equipment_types et ON e.equipment_type_id = et.id
      JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    // Role-based filtering
    if (user.role !== "admin") {
      query += ` AND e.base_id = $${paramIndex}`
      params.push(user.base_id)
      paramIndex++
    }

    query += " ORDER BY e.expenditure_date DESC"

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Get expenditures error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { base_id, equipment_type_id, quantity, expenditure_date, reason, operation_name } = data

    // Check permissions
    if (!canAccessBase(user.role, user.base_id, base_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await pool.query(
      `
      INSERT INTO expenditures (
        base_id, equipment_type_id, quantity, expenditure_date,
        reason, operation_name, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [base_id, equipment_type_id, quantity, expenditure_date, reason, operation_name, user.id],
    )

    const expenditure = result.rows[0]

    // Log audit event
    await logAuditEvent({
      user_id: user.id,
      action: "CREATE",
      table_name: "expenditures",
      record_id: expenditure.id,
      new_values: expenditure,
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(expenditure, { status: 201 })
  } catch (error) {
    console.error("Create expenditure error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
