"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import DataTable from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  role: string
  base_id: number | null
  full_name: string
}

interface Purchase {
  id: number
  base_name: string
  equipment_name: string
  quantity: number
  unit_cost: number
  total_cost: number
  supplier: string
  purchase_date: string
  purchase_order_number: string
  created_by_name: string
  created_at: string
}

export default function PurchasesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState({
    base_id: "",
    start_date: "",
    end_date: "",
    equipment_type: "",
  })
  const [newPurchase, setNewPurchase] = useState({
    base_id: "",
    equipment_type_id: "",
    quantity: "",
    unit_cost: "",
    supplier: "",
    purchase_date: "",
    purchase_order_number: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserAndPurchases()
  }, [filters])

  const fetchUserAndPurchases = async () => {
    try {
      // Check authentication
      const authResponse = await fetch("/api/auth/me")
      if (!authResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await authResponse.json()
      setUser(userData.user)

      // Set default base for non-admin users
      if (userData.user.role !== "admin" && userData.user.base_id) {
        setNewPurchase((prev) => ({ ...prev, base_id: userData.user.base_id.toString() }))
      }

      // Fetch purchases
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const purchasesResponse = await fetch(`/api/purchases?${params}`)
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json()
        setPurchases(purchasesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPurchase,
          base_id: Number.parseInt(newPurchase.base_id),
          equipment_type_id: Number.parseInt(newPurchase.equipment_type_id),
          quantity: Number.parseInt(newPurchase.quantity),
          unit_cost: Number.parseFloat(newPurchase.unit_cost),
        }),
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setNewPurchase({
          base_id: user?.role !== "admin" && user?.base_id ? user.base_id.toString() : "",
          equipment_type_id: "",
          quantity: "",
          unit_cost: "",
          supplier: "",
          purchase_date: "",
          purchase_order_number: "",
        })
        fetchUserAndPurchases()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create purchase")
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
      alert("Failed to create purchase")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const columns = [
    {
      key: "purchase_date",
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "base_name",
      label: "Base",
      sortable: true,
    },
    {
      key: "equipment_name",
      label: "Equipment",
      sortable: true,
    },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
    },
    {
      key: "unit_cost",
      label: "Unit Cost",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "total_cost",
      label: "Total Cost",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
    },
    {
      key: "purchase_order_number",
      label: "PO Number",
      sortable: true,
    },
    {
      key: "created_by_name",
      label: "Created By",
      sortable: true,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading purchases...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading purchases</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
              <p className="text-gray-600">Manage asset purchases and acquisitions</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Purchase</DialogTitle>
                  <DialogDescription>Record a new asset purchase for your base</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreatePurchase} className="space-y-4">
                  {user.role === "admin" && (
                    <div>
                      <Label htmlFor="base_id">Base</Label>
                      <Select
                        value={newPurchase.base_id}
                        onValueChange={(value) => setNewPurchase((prev) => ({ ...prev, base_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Base" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Fort Alpha</SelectItem>
                          <SelectItem value="2">Base Beta</SelectItem>
                          <SelectItem value="3">Outpost Gamma</SelectItem>
                          <SelectItem value="4">Naval Station Delta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="equipment_type_id">Equipment Type</Label>
                    <Select
                      value={newPurchase.equipment_type_id}
                      onValueChange={(value) => setNewPurchase((prev) => ({ ...prev, equipment_type_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">M4A1 Carbine</SelectItem>
                        <SelectItem value="2">M9 Pistol</SelectItem>
                        <SelectItem value="3">5.56mm Ammunition</SelectItem>
                        <SelectItem value="4">9mm Ammunition</SelectItem>
                        <SelectItem value="5">HMMWV</SelectItem>
                        <SelectItem value="6">M1A2 Abrams</SelectItem>
                        <SelectItem value="7">Body Armor</SelectItem>
                        <SelectItem value="8">Night Vision Goggles</SelectItem>
                        <SelectItem value="9">Radio Set</SelectItem>
                        <SelectItem value="10">Medical Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase((prev) => ({ ...prev, quantity: e.target.value }))}
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                    <Input
                      id="unit_cost"
                      type="number"
                      step="0.01"
                      value={newPurchase.unit_cost}
                      onChange={(e) => setNewPurchase((prev) => ({ ...prev, unit_cost: e.target.value }))}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      type="text"
                      value={newPurchase.supplier}
                      onChange={(e) => setNewPurchase((prev) => ({ ...prev, supplier: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={newPurchase.purchase_date}
                      onChange={(e) => setNewPurchase((prev) => ({ ...prev, purchase_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchase_order_number">Purchase Order Number</Label>
                    <Input
                      id="purchase_order_number"
                      type="text"
                      value={newPurchase.purchase_order_number}
                      onChange={(e) => setNewPurchase((prev) => ({ ...prev, purchase_order_number: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Purchase</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter purchases by date range and equipment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                {user.role === "admin" && (
                  <div>
                    <Label htmlFor="base_id">Base</Label>
                    <Select
                      value={filters.base_id}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, base_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Bases" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bases</SelectItem>
                        <SelectItem value="1">Fort Alpha</SelectItem>
                        <SelectItem value="2">Base Beta</SelectItem>
                        <SelectItem value="3">Outpost Gamma</SelectItem>
                        <SelectItem value="4">Naval Station Delta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="equipment_type">Equipment Type</Label>
                  <Select
                    value={filters.equipment_type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, equipment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      <SelectItem value="1">M4A1 Carbine</SelectItem>
                      <SelectItem value="2">M9 Pistol</SelectItem>
                      <SelectItem value="3">5.56mm Ammunition</SelectItem>
                      <SelectItem value="4">9mm Ammunition</SelectItem>
                      <SelectItem value="5">HMMWV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                {purchases.length} purchase{purchases.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={purchases} columns={columns} searchPlaceholder="Search purchases..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
