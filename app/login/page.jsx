"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Mail, Lock, UserX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", description: "", icon: null })
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          console.log("Error response data:", errorData) // Debug log
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          // Use status-based error messages if JSON parsing fails
          if (response.status === 401) {
            errorMessage = "Invalid credentials"
          } else if (response.status === 500) {
            errorMessage = "Internal server error"
          }
        }
        console.log("Throwing error:", errorMessage) // Debug log
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Redirect based on role
      if (data.role === "patient") {
        router.push("/patient/dashboard")
      } else if (data.role === "therapist") {
        router.push("/therapist/dashboard")
      } else if (data.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        console.warn("Unknown user role received:", data.role);
        router.push("/");
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      })
    } catch (error) {
      console.log("Caught error:", error.message) // Debug log
      // Handle specific error messages
      let errorTitle = "Login Failed"
      let errorDescription = "Please check your credentials and try again."
      let errorIcon = AlertCircle
      
      if (error.message === "Email not found") {
        errorTitle = "Email Not Found"
        errorDescription = "No account found with this email address. Please check your email or sign up for a new account."
        errorIcon = UserX
      } else if (error.message === "Incorrect password") {
        errorTitle = "Incorrect Password"
        errorDescription = "The password you entered is incorrect. Please try again or reset your password."
        errorIcon = Lock
      } else if (error.message === "Invalid credentials") {
        errorTitle = "Invalid Credentials"
        errorDescription = "The email or password you entered is incorrect. Please try again."
        errorIcon = AlertCircle
      } else if (error.message === "Internal server error") {
        errorTitle = "Server Error"
        errorDescription = "Something went wrong. Please try again later."
        errorIcon = AlertCircle
      } else if (error.message === "Internal server configuration error") {
        errorTitle = "Service Unavailable"
        errorDescription = "The service is temporarily unavailable. Please try again later."
        errorIcon = AlertCircle
      }

      // Show error dialog instead of toast
      setErrorDialog({
        open: true,
        title: errorTitle,
        description: errorDescription,
        icon: errorIcon
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-2xl font-bold text-teal-600">Speech Mate</h1>
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-600">
              New patient?{" "}
              <Link href="/signup" className="text-teal-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                {errorDialog.icon && <errorDialog.icon className="h-5 w-5 text-red-600" />}
              </div>
              <div>
                <DialogTitle className="text-left">{errorDialog.title}</DialogTitle>
                <DialogDescription className="text-left mt-1">
                  {errorDialog.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))}
              className="w-full sm:w-auto"
            >
              Try Again
            </Button>
            {errorDialog.title === "Email Not Found" && (
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full">
                  Sign Up
                </Button>
              </Link>
            )}
            {errorDialog.title === "Incorrect Password" && (
              <Link href="/forgot-password" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full">
                  Reset Password
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

