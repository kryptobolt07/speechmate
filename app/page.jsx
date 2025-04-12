"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from 'react'
import {
  Target,
  Calendar,
  Star,
  LineChart,
  Lock,
  Library,
  Menu,
  LogIn,
  UserPlus
} from 'lucide-react'

function CircleEffect({ x, y }) {
  return (
    <div 
      className="absolute w-4 h-4 bg-emerald-400/30 rounded-full animate-ripple"
      style={{
        left: x - 8,
        top: y - 8,
      }}
    />
  );
}

function FeatureCard({ title, description, linkText, icon: Icon }) {
  const [isHovered, setIsHovered] = useState(false);
  const [circles, setCircles] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCircles([...circles, {
      id: Date.now(),
      x,
      y
    }]);

    // Remove the circle effect after animation
    setTimeout(() => {
      setCircles(circles => circles.filter(circle => circle.id !== Date.now()));
    }, 1000);
  };
  
  return (
    <div 
      className={`relative bg-white rounded-lg p-6 transition-all duration-300 overflow-hidden ${
        isHovered ? 'shadow-emerald-300 shadow-lg transform -translate-y-1' : 'shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {circles.map(circle => (
        <CircleEffect key={circle.id} x={circle.x} y={circle.y} />
      ))}
      <div className="flex items-center mb-4">
        <div className="text-emerald-600 mr-3">
          <Icon size={24} strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <a 
        href="#" 
        className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200"
      >
        {linkText} <span className="ml-1">→</span>
      </a>
    </div>
  );
}

function StatCard({ number, label }) {
  const [circles, setCircles] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCircles([...circles, {
      id: Date.now(),
      x,
      y
    }]);

    setTimeout(() => {
      setCircles(circles => circles.filter(circle => circle.id !== Date.now()));
    }, 1000);
  };

  return (
    <div 
      className="relative bg-white rounded-lg p-6 text-center shadow-md cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {circles.map(circle => (
        <CircleEffect key={circle.id} x={circle.x} y={circle.y} />
      ))}
      <div className="text-4xl font-bold text-emerald-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      id: 1,
      title: "Automatic Case Allocation",
      description: "AI-powered matching of patients to the most suitable therapists based on specialty, availability, and case history.",
      linkText: "Explore smart allocation",
      icon: Target
    },
    {
      id: 2,
      title: "Dynamic Scheduling",
      description: "Intelligent calendar management that adapts to changing priorities, emergency cases, and therapist workloads.",
      linkText: "See flexible scheduling",
      icon: Calendar
    },
    {
      id: 3,
      title: "Comprehensive Review System",
      description: "Built-in feedback collection, performance metrics, and quality assurance for continuous improvement.",
      linkText: "Learn about reviews",
      icon: Star
    },
    {
      id: 4,
      title: "Progress Tracking",
      description: "Advanced analytics and visualization tools to monitor patient progress and therapy effectiveness.",
      linkText: "View analytics",
      icon: LineChart
    },
    {
      id: 5,
      title: "Secure Communication",
      description: "HIPAA-compliant messaging system for seamless communication between therapists, patients, and caregivers.",
      linkText: "Explore features",
      icon: Lock
    },
    {
      id: 6,
      title: "Resource Library",
      description: "Extensive collection of therapy materials, exercises, and resources for both therapists and patients.",
      linkText: "Browse library",
      icon: Library
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Hero Section */}
      <header className="bg-white/70 backdrop-blur-sm shadow-sm py-6 px-4 border-b sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold text-emerald-600 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              Speech Mate
            </h1>
          </div>
          <div className={`space-x-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <LogIn size={18} /> Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="gap-2">
                <UserPlus size={18} /> Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-white/50 to-transparent">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 text-gray-900 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                Simplifying Speech Therapy Management
              </h2>
              <p className={`text-xl mb-8 text-gray-600 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                A centralized platform connecting patients, therapists, and administrators for seamless therapy
                management.
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-450 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
            <div className={`md:w-1/2 flex justify-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="relative w-[500px] h-[400px] rounded-lg shadow-xl overflow-hidden">
                <Image
                  src="/i5.jpg"
                  alt="Speech therapist working with a child on pronunciation"
                  fill
                  className={`object-cover transition-transform duration-700 ${isLoaded ? 'scale-100' : 'scale-110'}`}
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-emerald-50/50">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <StatCard number="1000+" label="Active Patients" />
              <StatCard number="200+" label="Expert Therapists" />
              <StatCard number="95%" label="Success Rate" />
              <StatCard number="24/7" label="Support Available" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white/50">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 text-gray-900 transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              How Speech Mate Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                  style={{ transitionDelay: `${900 + index * 100}ms` }}
                >
                  <FeatureCard 
                    title={feature.title}
                    description={feature.description}
                    linkText={feature.linkText}
                    icon={feature.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-transparent to-emerald-50/30">
          <div className="container mx-auto px-4">
            <div className={`bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Speech Therapy?</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">Join thousands of therapists and patients already using Speech Mate</p>
              <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className={`bg-white/80 backdrop-blur-sm border-t py-8 transition-all duration-700 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">© 2025 Speech Mate. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(15);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

