import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken, canAccessBase } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { ObjectId } from "mongodb"
import type { Purchase } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const baseId = searchParams.get("base_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const equipmentType = searchParams.get("equipment_type")

    const db = await getDatabase()

    // Build match filter
    const matchFilter: any = {}

    // Role-based filtering
    if (user.role !== "admin") {
      matchFilter.base_id = user.base_id ? new ObjectId(user.base_id.toString()) : null
    } else if (baseId && baseId !== "all") {
      matchFilter.base_id = new ObjectId(baseId)
    }

    // Date filtering
    if (startDate && endDate) {
      matchFilter.purchase_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Equipment type filtering
    if (equipmentType && equipmentType !== "all") {
      matchFilter.equipment_type_id = new ObjectId(equipmentType)
    }

    const purchases = await db.purchases
      .aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: "bases",
            localField: "base_id",
            foreignField: "_id",
            as: "base",
          },
        },
        {
          $lookup: {
            from: "equipment_types",
            localField: "equipment_type_id",
            foreignField: "_id",
            as: "equipment",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $project: {
            _id: 1,
            base_name: { $arrayElemAt: ["$base.name", 0] },
            equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
            quantity: 1,
            unit_cost: 1,
            total_cost: 1,
            supplier: 1,
            purchase_date: 1,
            purchase_order_number: 1,
            created_by_name: { $arrayElemAt: ["$creator.full_name", 0] },
            created_at: 1,
          },
        },
        { $sort: { purchase_date: -1 } },
      ])
      .toArray()

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("Get purchases error:", error)
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
    const { base_id, equipment_type_id, quantity, unit_cost, supplier, purchase_date, purchase_order_number } = data

    // Check permissions
    if (!canAccessBase(user.role, user.base_id?.toString() || null, base_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()
    const total_cost = quantity * unit_cost

    const purchase: Purchase = {
      base_id: new ObjectId(base_id),
      equipment_type_id: new ObjectId(equipment_type_id),
      quantity,
      unit_cost,
      total_cost,
      supplier,
      purchase_date: new Date(purchase_date),
      purchase_order_number,
      created_by: new ObjectId(user._id!.toString()),
      created_at: new Date(),
    }

    const result = await db.purchases.insertOne(purchase)
    const insertedPurchase = { ...purchase, _id: result.insertedId }

    // Log audit event
    await logAuditEvent({
      user_id: user._id!.toString(),
      action: "CREATE",
      collection_name: "purchases",
      document_id: result.insertedId.toString(),
      new_values: insertedPurchase,
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(insertedPurchase, { status: 201 })
  } catch (error) {
    console.error("Create purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
