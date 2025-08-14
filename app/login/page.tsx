"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserPlus, LogIn, Building2, User, Mail, Lock, UserCheck } from "lucide-react"

interface Base {
  id: string
  name: string
  location: string
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [bases, setBases] = useState<Base[]>([])
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "",
    baseId: ""
  })
  const [signupError, setSignupError] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = async () => {
    try {
      const response = await fetch("/api/bases")
      if (response.ok) {
        const data = await response.json()
        setBases(data.bases)
      }
    } catch (error) {
      console.error("Error fetching bases:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError("")

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match")
      setSignupLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setSignupError("Password must be at least 6 characters long")
      setSignupLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          fullName: signupData.fullName,
          role: signupData.role,
          baseId: signupData.baseId || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSignupError("")
        // Switch to login tab after successful signup
        setActiveTab("login")
        setUsername(signupData.username)
        setError("Account created successfully! Please log in.")
      } else {
        const data = await response.json()
        setSignupError(data.error || "Signup failed")
      }
    } catch (error) {
      setSignupError("Network error. Please try again.")
    } finally {
      setSignupLoading(false)
    }
  }

  const updateSignupData = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Military Asset Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">Secure asset tracking and management system</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <CardDescription className="text-center mb-4">
                  Sign in to your account to access the system
                </CardDescription>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant={error.includes("successfully") ? "default" : "destructive"}>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>Admin:</strong> admin / password</p>
                    <p><strong>Base Commander:</strong> cmd_alpha / password</p>
                    <p><strong>Logistics Officer:</strong> log_alpha / password</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <CardDescription className="text-center mb-4">
                  Create a new account to join the system
                </CardDescription>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <Alert variant="destructive">
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={signupData.username}
                      onChange={(e) => updateSignupData("username", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => updateSignupData("email", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      value={signupData.fullName}
                      onChange={(e) => updateSignupData("fullName", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role
                    </Label>
                    <Select value={signupData.role} onValueChange={(value) => updateSignupData("role", value)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logistics_officer">Logistics Officer</SelectItem>
                        <SelectItem value="base_commander">Base Commander</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {signupData.role && signupData.role !== "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-base" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Base Assignment
                      </Label>
                      <Select value={signupData.baseId} onValueChange={(value) => updateSignupData("baseId", value)}>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select your base" />
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => updateSignupData("password", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a password (min 6 characters)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => updateSignupData("confirmPassword", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200" 
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
