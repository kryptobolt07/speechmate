import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-white py-6 px-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-teal-600">Speech Mate</h1>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-white to-teal-50">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Simplifying Speech Therapy Management
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                A centralized platform connecting patients, therapists, and administrators for seamless therapy
                management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started as Patient
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Therapist Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Speech Therapy Illustration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How Speech Mate Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>For Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Book appointments, schedule follow-ups, and track your therapy progress all in one place.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="text-teal-600 hover:underline">
                    Sign up as a patient →
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>For Therapists</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Manage your schedule, access patient records, and document session outcomes efficiently.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="text-teal-600 hover:underline">
                    Login as a therapist →
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>For Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Oversee operations, manage therapist assignments, and optimize resource allocation.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="text-teal-600 hover:underline">
                    Admin login →
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">© 2025 Speech Mate. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-teal-600">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-teal-600">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-600 hover:text-teal-600">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

