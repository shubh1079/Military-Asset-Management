"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Shield, 
  Building2, 
  Package, 
  Settings, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface User {
  id: string
  username: string
  email: string
  role: string
  base_id: string | null
  full_name: string
  created_at: string
  last_login?: string
}

interface Base {
  id: string
  name: string
  location: string
  commander_id?: string
  commander_name?: string
}

interface SystemStats {
  totalUsers: number
  totalBases: number
  totalAssets: number
  activeTransfers: number
  pendingApprovals: number
  recentActivity: number
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [bases, setBases] = useState<Base[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showCreateBaseDialog, setShowCreateBaseDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "",
    baseId: ""
  })
  const [newBase, setNewBase] = useState({
    name: "",
    location: "",
    commanderId: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch("/api/auth/me")
      if (!authResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await authResponse.json()
      setUser(userData.user)

      // Check if user is admin
      if (userData.user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      // Fetch bases
      const basesResponse = await fetch("/api/bases")
      if (basesResponse.ok) {
        const basesData = await basesResponse.json()
        setBases(basesData.bases)
      }

      // Fetch system stats
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setShowCreateUserDialog(false)
        setNewUser({
          username: "",
          email: "",
          password: "",
          fullName: "",
          role: "",
          baseId: ""
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Failed to create user")
    }
  }

  const handleCreateBase = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/bases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBase),
      })

      if (response.ok) {
        setShowCreateBaseDialog(false)
        setNewBase({
          name: "",
          location: "",
          commanderId: ""
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create base")
      }
    } catch (error) {
      console.error("Error creating base:", error)
      alert("Failed to create base")
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: "destructive" as const, label: "Administrator" },
      base_commander: { variant: "default" as const, label: "Base Commander" },
      logistics_officer: { variant: "secondary" as const, label: "Logistics Officer" },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || { variant: "secondary" as const, label: role }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "inactive":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Admin Panel...</p>
          <p className="text-sm text-gray-500">Securing administrative access</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              System Administration
            </h1>
            <p className="text-gray-600 mt-1">Manage users, bases, and system configuration</p>
          </div>

          {/* System Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <p className="text-xs text-blue-600">Active accounts</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Total Bases</CardTitle>
                  <Building2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalBases}</div>
                  <p className="text-xs text-green-600">Operational bases</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Total Assets</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalAssets}</div>
                  <p className="text-xs text-purple-600">Tracked items</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                  <p className="text-xs text-orange-600">Awaiting action</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="bases" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Base Management
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage system users and their permissions</CardDescription>
                    </div>
                    <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>Add a new user to the system</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={newUser.fullName}
                              onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="base_commander">Base Commander</SelectItem>
                                <SelectItem value="logistics_officer">Logistics Officer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="baseId">Base Assignment</Label>
                            <Select value={newUser.baseId} onValueChange={(value) => setNewUser(prev => ({ ...prev, baseId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select base (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Base Assignment</SelectItem>
                                {bases.map((base) => (
                                  <SelectItem key={base.id} value={base.id}>
                                    {base.name} - {base.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                              required
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create User</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{user.full_name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(user.role)}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bases" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Base Management</CardTitle>
                      <CardDescription>Manage military bases and their commanders</CardDescription>
                    </div>
                    <Dialog open={showCreateBaseDialog} onOpenChange={setShowCreateBaseDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Base
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Base</DialogTitle>
                          <DialogDescription>Add a new military base to the system</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateBase} className="space-y-4">
                          <div>
                            <Label htmlFor="baseName">Base Name</Label>
                            <Input
                              id="baseName"
                              value={newBase.name}
                              onChange={(e) => setNewBase(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={newBase.location}
                              onChange={(e) => setNewBase(prev => ({ ...prev, location: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="commanderId">Base Commander</Label>
                            <Select value={newBase.commanderId} onValueChange={(value) => setNewBase(prev => ({ ...prev, commanderId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select commander (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Commander Assigned</SelectItem>
                                {users.filter(u => u.role === "base_commander").map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowCreateBaseDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Base</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bases.map((base) => (
                      <div key={base.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{base.name}</h3>
                            <p className="text-sm text-gray-500">{base.location}</p>
                            {base.commander_name && (
                              <p className="text-xs text-gray-400">Commander: {base.commander_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for all users</p>
                          </div>
                          <Button variant="outline">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Session Timeout</p>
                            <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                          </div>
                          <Button variant="outline">Configure</Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Backup & Recovery</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Database Backup</p>
                            <p className="text-sm text-gray-500">Last backup: 2 hours ago</p>
                          </div>
                          <Button variant="outline">Backup Now</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logs</p>
                            <p className="text-sm text-gray-500">System activity tracking</p>
                          </div>
                          <Button variant="outline">View Logs</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
