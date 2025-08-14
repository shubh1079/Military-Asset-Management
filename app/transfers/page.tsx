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
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ArrowRight, RefreshCw, Filter } from "lucide-react"

interface User {
  id: string
  username: string
  email: string
  role: string
  base_id: string | null
  full_name: string
}

interface Transfer {
  id: string
  from_base_name: string
  to_base_name: string
  equipment_name: string
  quantity: number
  transfer_date: string
  reason: string
  status: string
  requested_by_name: string
  approved_by_name: string | null
  created_at: string
}

interface Base {
  id: string
  name: string
  location: string
}

interface EquipmentType {
  id: string
  name: string
  category: string
}

export default function TransfersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [bases, setBases] = useState<Base[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    base_id: "",
    status: "",
  })
  const [newTransfer, setNewTransfer] = useState({
    from_base_id: "",
    to_base_id: "",
    equipment_type_id: "",
    quantity: "",
    transfer_date: "",
    reason: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserAndData()
  }, [filters])

  const fetchUserAndData = async () => {
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
        setNewTransfer((prev) => ({ ...prev, from_base_id: userData.user.base_id.toString() }))
      }

      // Fetch bases
      const basesResponse = await fetch("/api/bases")
      if (basesResponse.ok) {
        const basesData = await basesResponse.json()
        setBases(basesData.bases)
      }

      // Fetch equipment types
      const equipmentResponse = await fetch("/api/equipment-types")
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json()
        setEquipmentTypes(equipmentData.equipment_types)
      }

      // Fetch transfers
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const transfersResponse = await fetch(`/api/transfers?${params}`)
      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json()
        setTransfers(transfersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTransfer,
          quantity: parseInt(newTransfer.quantity),
        }),
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setNewTransfer({
          from_base_id: user?.role !== "admin" && user?.base_id ? user.base_id.toString() : "",
          to_base_id: "",
          equipment_type_id: "",
          quantity: "",
          transfer_date: "",
          reason: "",
        })
        fetchUserAndData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create transfer")
      }
    } catch (error) {
      console.error("Error creating transfer:", error)
      alert("Failed to create transfer")
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      in_transit: { variant: "default" as const, label: "In Transit", className: "bg-blue-100 text-blue-800" },
      completed: { variant: "default" as const, label: "Completed", className: "bg-green-100 text-green-800" },
      cancelled: { variant: "destructive" as const, label: "Cancelled", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status, className: "bg-gray-100 text-gray-800" }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const columns = [
    {
      key: "transfer_date",
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "from_base_name",
      label: "From",
      sortable: true,
    },
    {
      key: "to_base_name",
      label: "To",
      sortable: true,
      render: (value: string, row: Transfer) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.from_base_name}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      ),
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
      render: (value: number) => (
        <Badge variant="outline" className="font-mono">
          {value.toLocaleString()}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: false,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "requested_by_name",
      label: "Requested By",
      sortable: true,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Transfers...</p>
          <p className="text-sm text-gray-500">Fetching transfer data</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading transfers</div>
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Asset Transfers
              </h1>
              <p className="text-gray-600 mt-1">Manage asset transfers between bases</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUserAndData()}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    New Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Transfer</DialogTitle>
                    <DialogDescription>Request a transfer of assets between bases</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateTransfer} className="space-y-4">
                    <div>
                      <Label htmlFor="from_base_id">From Base</Label>
                      <Select
                        value={newTransfer.from_base_id}
                        onValueChange={(value) => setNewTransfer((prev) => ({ ...prev, from_base_id: value }))}
                        disabled={user.role !== "admin"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Source Base" />
                        </SelectTrigger>
                        <SelectContent>
                          {bases.map((base) => (
                            <SelectItem key={base.id} value={base.id}>
                              {base.name} - {base.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="to_base_id">To Base</Label>
                      <Select
                        value={newTransfer.to_base_id}
                        onValueChange={(value) => setNewTransfer((prev) => ({ ...prev, to_base_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Destination Base" />
                        </SelectTrigger>
                        <SelectContent>
                          {bases.map((base) => (
                            <SelectItem key={base.id} value={base.id}>
                              {base.name} - {base.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="equipment_type_id">Equipment Type</Label>
                      <Select
                        value={newTransfer.equipment_type_id}
                        onValueChange={(value) => setNewTransfer((prev) => ({ ...prev, equipment_type_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentTypes.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              {equipment.name} ({equipment.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newTransfer.quantity}
                        onChange={(e) => setNewTransfer((prev) => ({ ...prev, quantity: e.target.value }))}
                        required
                        min="1"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="transfer_date">Transfer Date</Label>
                      <Input
                        id="transfer_date"
                        type="date"
                        value={newTransfer.transfer_date}
                        onChange={(e) => setNewTransfer((prev) => ({ ...prev, transfer_date: e.target.value }))}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={newTransfer.reason}
                        onChange={(e) => setNewTransfer((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="Explain the reason for this transfer..."
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        Create Transfer
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6 border-2 border-blue-100 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Transfer Filters
                </CardTitle>
                <CardDescription>Filter transfers by base and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role === "admin" && (
                    <div>
                      <Label htmlFor="base_id">Base</Label>
                      <Select
                        value={filters.base_id}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, base_id: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Bases" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Bases</SelectItem>
                          {bases.map((base) => (
                            <SelectItem key={base.id} value={base.id}>
                              {base.name} - {base.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfers Table */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>
                {transfers.length} transfer{transfers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={transfers} columns={columns} searchPlaceholder="Search transfers..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
