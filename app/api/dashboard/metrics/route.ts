import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

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

    // Build base filter based on user role
    const baseFilter: any = {}
    if (user.role !== "admin") {
      baseFilter.base_id = user.base_id ? new ObjectId(user.base_id.toString()) : null
    } else if (baseId && baseId !== "all") {
      baseFilter.base_id = new ObjectId(baseId)
    }

    // Date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Equipment type filter
    const equipmentFilter: any = {}
    if (equipmentType && equipmentType !== "all") {
      equipmentFilter.equipment_type_id = new ObjectId(equipmentType)
    }

    // Get purchases with aggregation
    const purchasesAgg = await db.purchases
      .aggregate([
        {
          $match: {
            ...baseFilter,
            ...dateFilter,
            ...equipmentFilter,
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
          $group: {
            _id: null,
            total_quantity: { $sum: "$quantity" },
            breakdown: {
              $push: {
                equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
                quantity: "$quantity",
              },
            },
          },
        },
      ])
      .toArray()

    // Get transfers in
    const transfersInAgg = await db.transfers
      .aggregate([
        {
          $match: {
            to_base_id: baseFilter.base_id || { $exists: true },
            status: "completed",
            ...dateFilter,
            ...equipmentFilter,
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
          $group: {
            _id: null,
            total_quantity: { $sum: "$quantity" },
            breakdown: {
              $push: {
                equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
                quantity: "$quantity",
              },
            },
          },
        },
      ])
      .toArray()

    // Get transfers out
    const transfersOutAgg = await db.transfers
      .aggregate([
        {
          $match: {
            from_base_id: baseFilter.base_id || { $exists: true },
            status: "completed",
            ...dateFilter,
            ...equipmentFilter,
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
          $group: {
            _id: null,
            total_quantity: { $sum: "$quantity" },
            breakdown: {
              $push: {
                equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
                quantity: "$quantity",
              },
            },
          },
        },
      ])
      .toArray()

    // Get assignments
    const assignmentsCount = await db.assignments.countDocuments({
      status: "active",
      ...dateFilter,
    })

    // Get expenditures
    const expendituresAgg = await db.expenditures
      .aggregate([
        {
          $match: {
            ...baseFilter,
            ...dateFilter,
            ...equipmentFilter,
          },
        },
        {
          $group: {
            _id: null,
            total_quantity: { $sum: "$quantity" },
          },
        },
      ])
      .toArray()

    // Calculate totals
    const totalPurchases = purchasesAgg[0]?.total_quantity || 0
    const totalTransfersIn = transfersInAgg[0]?.total_quantity || 0
    const totalTransfersOut = transfersOutAgg[0]?.total_quantity || 0
    const totalExpenditures = expendituresAgg[0]?.total_quantity || 0

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut
    const openingBalance = 1000 // This would be calculated based on historical data
    const closingBalance = openingBalance + netMovement - totalExpenditures

    return NextResponse.json({
      openingBalance: openingBalance,
      closingBalance: closingBalance,
      netMovement: netMovement,
      purchases: totalPurchases,
      transfersIn: totalTransfersIn,
      transfersOut: totalTransfersOut,
      assignments: assignmentsCount,
      expenditures: totalExpenditures,
      breakdown: {
        purchases: purchasesAgg[0]?.breakdown || [],
        transfersIn: transfersInAgg[0]?.breakdown || [],
        transfersOut: transfersOutAgg[0]?.breakdown || [],
      },
    })
  } catch (error) {
    console.error("Dashboard metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
