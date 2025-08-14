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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Zap } from "lucide-react"

interface Assignment {
  id: number
  asset_id: number
  equipment_name: string
  serial_number: string
  assigned_to: string
  assigned_by_name: string
  assignment_date: string
  return_date: string | null
  purpose: string
  status: string
  created_at: string
}

interface Expenditure {
  id: number
  base_name: string
  equipment_name: string
  quantity: number
  expenditure_date: string
  reason: string
  operation_name: string
  recorded_by_name: string
  created_at: string
}

interface UserData {
  id: number
  username: string
  email: string
  role: string
  base_id: number | null
  full_name: string
}

export default function AssignmentsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const [showExpenditureDialog, setShowExpenditureDialog] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    asset_id: "",
    assigned_to: "",
    assignment_date: "",
    purpose: "",
  })
  const [newExpenditure, setNewExpenditure] = useState({
    base_id: "",
    equipment_type_id: "",
    quantity: "",
    expenditure_date: "",
    reason: "",
    operation_name: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch("/api/auth/me")
      if (!authResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await authResponse.json()
      setUser(userData.user)

      // Check permissions
      if (!["admin", "base_commander"].includes(userData.user.role)) {
        router.push("/dashboard")
        return
      }

      // Set default base for non-admin users
      if (userData.user.role !== "admin" && userData.user.base_id) {
        setNewExpenditure((prev) => ({ ...prev, base_id: userData.user.base_id.toString() }))
      }

      // Fetch assignments and expenditures
      const [assignmentsResponse, expendituresResponse] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/expenditures"),
      ])

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json()
        setAssignments(assignmentsData)
      }

      if (expendituresResponse.ok) {
        const expendituresData = await expendituresResponse.json()
        setExpenditures(expendituresData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAssignment,
          asset_id: Number.parseInt(newAssignment.asset_id),
        }),
      })

      if (response.ok) {
        setShowAssignmentDialog(false)
        setNewAssignment({
          asset_id: "",
          assigned_to: "",
          assignment_date: "",
          purpose: "",
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create assignment")
      }
    } catch (error) {
      console.error("Error creating assignment:", error)
      alert("Failed to create assignment")
    }
  }

  const handleCreateExpenditure = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/expenditures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newExpenditure,
          base_id: Number.parseInt(newExpenditure.base_id),
          equipment_type_id: Number.parseInt(newExpenditure.equipment_type_id),
          quantity: Number.parseInt(newExpenditure.quantity),
        }),
      })

      if (response.ok) {
        setShowExpenditureDialog(false)
        setNewExpenditure({
          base_id: user?.role !== "admin" && user?.base_id ? user.base_id.toString() : "",
          equipment_type_id: "",
          quantity: "",
          expenditure_date: "",
          reason: "",
          operation_name: "",
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create expenditure")
      }
    } catch (error) {
      console.error("Error creating expenditure:", error)
      alert("Failed to create expenditure")
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
      active: { variant: "default" as const, label: "Active" },
      returned: { variant: "secondary" as const, label: "Returned" },
      lost: { variant: "destructive" as const, label: "Lost" },
      damaged: { variant: "destructive" as const, label: "Damaged" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const assignmentColumns = [
    {
      key: "assignment_date",
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "equipment_name",
      label: "Equipment",
      sortable: true,
    },
    {
      key: "serial_number",
      label: "Serial Number",
      sortable: true,
    },
    {
      key: "assigned_to",
      label: "Assigned To",
      sortable: true,
    },
    {
      key: "purpose",
      label: "Purpose",
      sortable: false,
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "assigned_by_name",
      label: "Assigned By",
      sortable: true,
    },
  ]

  const expenditureColumns = [
    {
      key: "expenditure_date",
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
      key: "operation_name",
      label: "Operation",
      sortable: true,
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
      key: "recorded_by_name",
      label: "Recorded By",
      sortable: true,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading assignments</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assignments & Expenditures</h1>
              <p className="text-gray-600">Manage asset assignments and track expenditures</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    New Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>Assign an asset to personnel</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <Label htmlFor="asset_id">Asset</Label>
                      <Select
                        value={newAssignment.asset_id}
                        onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, asset_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">M4A1 Carbine - M4-001</SelectItem>
                          <SelectItem value="3">M9 Pistol - M9-001</SelectItem>
                          <SelectItem value="4">HMMWV - HMV-001</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="assigned_to">Assigned To</Label>
                      <Input
                        id="assigned_to"
                        type="text"
                        value={newAssignment.assigned_to}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, assigned_to: e.target.value }))}
                        placeholder="Personnel name or ID"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="assignment_date">Assignment Date</Label>
                      <Input
                        id="assignment_date"
                        type="date"
                        value={newAssignment.assignment_date}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, assignment_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="purpose">Purpose</Label>
                      <Textarea
                        id="purpose"
                        value={newAssignment.purpose}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, purpose: e.target.value }))}
                        placeholder="Purpose of assignment..."
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Assignment</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={showExpenditureDialog} onOpenChange={setShowExpenditureDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Record Expenditure
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Expenditure</DialogTitle>
                    <DialogDescription>Record assets that have been consumed or expended</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateExpenditure} className="space-y-4">
                    {user.role === "admin" && (
                      <div>
                        <Label htmlFor="base_id">Base</Label>
                        <Select
                          value={newExpenditure.base_id}
                          onValueChange={(value) => setNewExpenditure((prev) => ({ ...prev, base_id: value }))}
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
                        value={newExpenditure.equipment_type_id}
                        onValueChange={(value) => setNewExpenditure((prev) => ({ ...prev, equipment_type_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">5.56mm Ammunition</SelectItem>
                          <SelectItem value="4">9mm Ammunition</SelectItem>
                          <SelectItem value="10">Medical Kit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newExpenditure.quantity}
                        onChange={(e) => setNewExpenditure((prev) => ({ ...prev, quantity: e.target.value }))}
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expenditure_date">Expenditure Date</Label>
                      <Input
                        id="expenditure_date"
                        type="date"
                        value={newExpenditure.expenditure_date}
                        onChange={(e) => setNewExpenditure((prev) => ({ ...prev, expenditure_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="operation_name">Operation Name</Label>
                      <Input
                        id="operation_name"
                        type="text"
                        value={newExpenditure.operation_name}
                        onChange={(e) => setNewExpenditure((prev) => ({ ...prev, operation_name: e.target.value }))}
                        placeholder="Operation or exercise name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={newExpenditure.reason}
                        onChange={(e) => setNewExpenditure((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="Reason for expenditure..."
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowExpenditureDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Record Expenditure</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="assignments" className="space-y-6">
            <TabsList>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="expenditures">Expenditures</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Assignments</CardTitle>
                  <CardDescription>
                    {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable data={assignments} columns={assignmentColumns} searchPlaceholder="Search assignments..." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenditures">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Expenditures</CardTitle>
                  <CardDescription>
                    {expenditures.length} expenditure{expenditures.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={expenditures}
                    columns={expenditureColumns}
                    searchPlaceholder="Search expenditures..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
