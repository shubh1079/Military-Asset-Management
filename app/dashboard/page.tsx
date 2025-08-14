"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import MetricCard from "@/components/ui/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  ArrowUpDown, 
  Users, 
  Zap, 
  ShoppingCart, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  role: string
  base_id: number | null
  full_name: string
}

interface Metrics {
  openingBalance: number
  closingBalance: number
  netMovement: number
  purchases: number
  transfersIn: number
  transfersOut: number
  assignments: number
  expenditures: number
  breakdown: {
    purchases: Array<{ equipment_name: string; quantity: number }>
    transfersIn: Array<{ equipment_name: string; quantity: number }>
    transfersOut: Array<{ equipment_name: string; quantity: number }>
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showNetMovementDialog, setShowNetMovementDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [filters, setFilters] = useState({
    base_id: "all",
    start_date: "",
    end_date: "",
    equipment_type: "all",
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserAndMetrics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUserAndMetrics(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchUserAndMetrics = async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)
    
    try {
      // Check authentication
      const authResponse = await fetch("/api/auth/me")
      if (!authResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await authResponse.json()
      setUser(userData.user)

      // Fetch metrics
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "all") params.append(key, value)
      })

      const metricsResponse = await fetch(`/api/dashboard/metrics?${params}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
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

  const getUtilizationRate = () => {
    if (!metrics) return 0
    return Math.round((metrics.assignments / metrics.closingBalance) * 100) || 0
  }

  const getMovementTrend = () => {
    if (!metrics) return "neutral"
    if (metrics.netMovement > 0) return "positive"
    if (metrics.netMovement < 0) return "negative"
    return "neutral"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Military Asset Dashboard...</p>
          <p className="text-sm text-gray-500">Securing your data</p>
        </div>
      </div>
    )
  }

  if (!user || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Military Asset Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time asset management overview</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                {refreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
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
                onClick={() => fetchUserAndMetrics(true)}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6 border-2 border-blue-100 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Data Filters
                </CardTitle>
                <CardDescription>Filter data by date range, base, and equipment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
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
                      <SelectTrigger className="mt-1">
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
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Opening Balance"
              value={metrics.openingBalance}
              icon={Package}
              description="Assets at period start"
              trend="neutral"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            />
            <MetricCard
              title="Closing Balance"
              value={metrics.closingBalance}
              icon={Package}
              description="Current asset count"
              trend="neutral"
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            />
            <MetricCard
              title="Net Movement"
              value={metrics.netMovement}
              icon={ArrowUpDown}
              description="Purchases + Transfers In - Transfers Out"
              trend={getMovementTrend()}
              onClick={() => setShowNetMovementDialog(true)}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            />
            <MetricCard
              title="Assigned Assets"
              value={metrics.assignments}
              icon={Users}
              description="Currently assigned to personnel"
              trend="neutral"
              className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            />
          </div>

          {/* Utilization and Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <BarChart3 className="h-5 w-5" />
                  Asset Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilization Rate</span>
                      <span className="font-medium">{getUtilizationRate()}%</span>
                    </div>
                    <Progress value={getUtilizationRate()} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>{metrics.assignments}</strong> of <strong>{metrics.closingBalance}</strong> assets assigned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                  Asset Inflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Purchases</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{metrics.purchases}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transfers In</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +{metrics.transfersIn}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Inflow</span>
                      <span className="text-green-600">+{metrics.purchases + metrics.transfersIn}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-700">
                  <TrendingDown className="h-5 w-5" />
                  Asset Outflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transfers Out</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      -{metrics.transfersOut}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expenditures</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      -{metrics.expenditures}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Outflow</span>
                      <span className="text-red-600">-{metrics.transfersOut + metrics.expenditures}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="Purchases" 
              value={metrics.purchases} 
              icon={ShoppingCart} 
              description="New acquisitions"
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            />
            <MetricCard 
              title="Transfers In" 
              value={metrics.transfersIn} 
              icon={ArrowUp} 
              description="Assets received"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            />
            <MetricCard 
              title="Transfers Out" 
              value={metrics.transfersOut} 
              icon={ArrowDown} 
              description="Assets sent"
              className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            />
          </div>

          <div className="mt-6">
            <MetricCard
              title="Expenditures"
              value={metrics.expenditures}
              icon={Zap}
              description="Assets consumed/expended"
              className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
            />
          </div>
        </div>
      </div>

      {/* Net Movement Detail Dialog */}
      <Dialog open={showNetMovementDialog} onOpenChange={setShowNetMovementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Net Movement Breakdown
            </DialogTitle>
            <DialogDescription>Detailed view of purchases, transfers in, and transfers out</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Purchases ({metrics.purchases})
              </h3>
              {metrics.breakdown.purchases.length > 0 ? (
                <div className="space-y-2">
                  {metrics.breakdown.purchases.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{item.equipment_name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No purchases in this period</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                Transfers In ({metrics.transfersIn})
              </h3>
              {metrics.breakdown.transfersIn.length > 0 ? (
                <div className="space-y-2">
                  {metrics.breakdown.transfersIn.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{item.equipment_name}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        +{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No transfers in during this period</p>
              )}
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <ArrowDown className="h-5 w-5" />
                Transfers Out ({metrics.transfersOut})
              </h3>
              {metrics.breakdown.transfersOut.length > 0 ? (
                <div className="space-y-2">
                  {metrics.breakdown.transfersOut.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{item.equipment_name}</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        -{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No transfers out during this period</p>
              )}
            </div>

            <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-semibold">
                <span>Net Movement:</span>
                <Badge 
                  variant="secondary" 
                  className={metrics.netMovement >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {metrics.netMovement >= 0 ? "+" : ""}{metrics.netMovement}
                </Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
