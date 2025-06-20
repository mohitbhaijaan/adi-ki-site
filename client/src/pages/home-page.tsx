import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, Headphones, Gamepad2, Eye, Zap, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@shared/schema";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  const { data: announcement } = useQuery<Announcement>({
    queryKey: ["/api/announcements/active"],
  });

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <ParticlesBackground />

      {/* Announcement Ticker */}
      {announcement && (
        <div className="bg-gradient-to-r from-red-500 to-red-700 p-2 relative z-10">
          <div className="container mx-auto">
            <div className="flex items-center">
              <Gamepad2 className="text-white mr-3 w-4 h-4" />
              <div className="text-white text-sm font-medium animate-pulse">
                {announcement.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-sm border-b border-red-500/30 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Products
              </Link>
              <Link href="/contact" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Contact
              </Link>
              {user?.isAdmin ? (
                <Link href="/admin">
                  <Button className="btn-glow">Admin Panel</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="btn-glow">Login</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" className="md:hidden text-red-500">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="border-r border-red-500/20"></div>
                ))}
              </div>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-glow animate-pulse-red">
              Welcome to <span className="text-red-500 font-mono">ADI CHEATS</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 font-light">
              Your Ultimate Gaming Edge
            </p>
            <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
              Professional gaming enhancement tools designed for serious players. Secure, undetected, and constantly updated.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/products">
                <Button className="btn-glow text-lg px-8 py-4 animate-glow">
                  <Gamepad2 className="mr-2 w-5 h-5" />
                  Explore Products
                </Button>
              </Link>
              <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 text-lg px-8 py-4">
                <Eye className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-3 h-3 bg-red-700 rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-2 h-2 bg-red-500 rounded-full opacity-80"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-6 text-glow">Why Choose ADI CHEATS?</h3>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional gaming enhancement solutions with enterprise-level security and 24/7 support.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="card-glow hover:bg-glow transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-red-500 text-4xl mb-4 group-hover:animate-pulse">
                    <Shield className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-glow">Undetected</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Advanced anti-detection technology ensures your gaming sessions remain secure and uninterrupted.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-glow hover:bg-glow transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-red-500 text-4xl mb-4 group-hover:animate-pulse">
                    <FolderSync className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-glow">Always Updated</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Regular updates and patches to stay ahead of game security measures and anti-cheat systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-glow hover:bg-glow transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-red-500 text-4xl mb-4 group-hover:animate-pulse">
                    <Headphones className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-glow">24/7 Support</h4>
                  <p className="text-gray-400 leading-relaxed">
                    Round-the-clock customer support with live chat for immediate assistance and troubleshooting.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-6 text-glow">Featured Products</h3>
              <p className="text-xl text-gray-400">
                Premium gaming enhancement tools for competitive players
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Sample Product Cards */}
              <Card className="card-glow hover:bg-glow transition-all duration-300 group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
                  <Gamepad2 className="text-red-500 w-16 h-16" />
                  <div className="absolute top-4 right-4 bg-red-500 text-black px-2 py-1 rounded text-sm font-bold">
                    #A001
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-2 text-glow">Aimbot Pro V2</h4>
                  <p className="text-gray-400 mb-4">Advanced aimbot with customizable settings for FPS games</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-500">$29.99 USD</span>
                    <Button className="btn-glow">View Details</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow hover:bg-glow transition-all duration-300 group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
                  <Eye className="text-red-500 w-16 h-16" />
                  <div className="absolute top-4 right-4 bg-red-500 text-black px-2 py-1 rounded text-sm font-bold">
                    #A002
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-2 text-glow">ESP Wallhack</h4>
                  <p className="text-gray-400 mb-4">See through walls and track enemies in real-time</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-500">₹1,999 INR</span>
                    <Button className="btn-glow">View Details</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow hover:bg-glow transition-all duration-300 group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
                  <Zap className="text-red-500 w-16 h-16" />
                  <div className="absolute top-4 right-4 bg-red-500 text-black px-2 py-1 rounded text-sm font-bold">
                    #A003
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-2 text-glow">No Recoil Script</h4>
                  <p className="text-gray-400 mb-4">Eliminate weapon recoil for perfect accuracy</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-500">৳1,500 BDT</span>
                    <Button className="btn-glow">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/products">
                <Button className="btn-glow text-lg px-8 py-4">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-900 to-black py-12 border-t border-red-500/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <Logo className="mb-4" />
                <p className="text-gray-400 leading-relaxed">
                  Professional gaming enhancement tools with enterprise-level security and support.
                </p>
              </div>

              <div>
                <h5 className="text-lg font-semibold mb-4 text-red-500">Quick Links</h5>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-red-500 transition-colors">Home</Link></li>
                  <li><Link href="/products" className="text-gray-400 hover:text-red-500 transition-colors">Products</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-red-500 transition-colors">Contact</Link></li>
                  <li><Link href="/admin" className="text-gray-400 hover:text-red-500 transition-colors">Admin Panel</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-semibold mb-4 text-red-500">Support</h5>
                <ul className="space-y-2">
                  <li><span className="text-gray-400">Live Chat</span></li>
                  <li><span className="text-gray-400">Documentation</span></li>
                  <li><span className="text-gray-400">FAQ</span></li>
                  <li><span className="text-gray-400">Terms of Service</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-red-500/30 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2024 ADI CHEATS. All rights reserved. | Secure & Professional Gaming Solutions
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
