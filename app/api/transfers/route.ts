import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken, canAccessBase } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const baseId = searchParams.get("base_id")
    const status = searchParams.get("status")

    const db = await getDatabase()

    // Build match conditions
    const matchConditions: any = {}

    // Role-based filtering
    if (user.role !== "admin") {
      matchConditions.$or = [
        { from_base_id: new ObjectId(user.base_id!.toString()) },
        { to_base_id: new ObjectId(user.base_id!.toString()) }
      ]
    } else if (baseId) {
      matchConditions.$or = [
        { from_base_id: new ObjectId(baseId) },
        { to_base_id: new ObjectId(baseId) }
      ]
    }

    // Status filtering
    if (status) {
      matchConditions.status = status
    }

    // Aggregate pipeline to get transfers with related data
    const transfers = await db.transfers.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "bases",
          localField: "from_base_id",
          foreignField: "_id",
          as: "from_base"
        }
      },
      {
        $lookup: {
          from: "bases",
          localField: "to_base_id",
          foreignField: "_id",
          as: "to_base"
        }
      },
      {
        $lookup: {
          from: "equipment_types",
          localField: "equipment_type_id",
          foreignField: "_id",
          as: "equipment"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "requested_by",
          foreignField: "_id",
          as: "requested_by_user"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "approved_by",
          foreignField: "_id",
          as: "approved_by_user"
        }
      },
      {
        $project: {
          id: { $toString: "$_id" },
          from_base_name: { $arrayElemAt: ["$from_base.name", 0] },
          to_base_name: { $arrayElemAt: ["$to_base.name", 0] },
          equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
          quantity: 1,
          transfer_date: 1,
          reason: 1,
          status: 1,
          requested_by_name: { $arrayElemAt: ["$requested_by_user.full_name", 0] },
          approved_by_name: { $arrayElemAt: ["$approved_by_user.full_name", 0] },
          created_at: 1
        }
      },
      { $sort: { created_at: -1 } }
    ]).toArray()

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("Get transfers error:", error)
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
    const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, reason } = data

    const db = await getDatabase()

    // Check permissions for source base
    if (!canAccessBase(user.role, user.base_id?.toString(), from_base_id.toString())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create transfer
    const newTransfer = {
      from_base_id: new ObjectId(from_base_id),
      to_base_id: new ObjectId(to_base_id),
      equipment_type_id: new ObjectId(equipment_type_id),
      quantity: parseInt(quantity),
      transfer_date: new Date(transfer_date),
      reason,
      status: "pending",
      requested_by: new ObjectId(user._id!.toString()),
      approved_by: null,
      created_at: new Date(),
      completed_at: null
    }

    const result = await db.transfers.insertOne(newTransfer)
    const transfer = await db.transfers.findOne({ _id: result.insertedId })

    // Log audit event
    await logAuditEvent({
      user_id: user._id!.toString(),
      action: "CREATE",
      collection_name: "transfers",
      document_id: result.insertedId.toString(),
      ip_address: request.ip,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(transfer, { status: 201 })
  } catch (error) {
    console.error("Create transfer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
