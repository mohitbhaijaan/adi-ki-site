import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, Headphones, Gamepad2, Eye, Zap, Menu, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticlesBackground />

      {/* Announcement Ticker */}
      {announcement && announcement.isActive && (
        <div className="bg-red-500 text-black py-2 px-4 text-center font-bold text-sm animate-pulse overflow-hidden whitespace-nowrap">
          <div className="animate-marquee">
            🔥 {announcement.message} 🔥
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-500/30">
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
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button className="btn-glow">Admin Panel</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-red-500/20"></div>
            ))}
          </div>
        </div>

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-red-500/5 via-transparent to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Main Hero Content */}
            <div className="mb-16">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-8 animate-pulse-red">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm font-medium text-red-400">Professional Gaming Tools</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Ultimate</span>
                <br />
                <span className="text-red-500 font-mono text-glow">Gaming Edge</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Professional gaming enhancement tools for competitive players. 
                <span className="text-red-400"> Undetected, secure, and constantly updated.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/products">
                  <Button className="btn-glow text-lg px-10 py-4 h-14 font-semibold">
                    <Gamepad2 className="mr-3 w-6 h-6" />
                    Browse Products
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 text-lg px-10 py-4 h-14 font-semibold transition-all duration-300"
                >
                  <Eye className="mr-3 w-6 h-6" />
                  View Features
                </Button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group p-6 rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Undetected</h3>
                <p className="text-gray-400 text-sm">Advanced anti-detection technology ensures safe gaming sessions</p>
              </div>

              <div className="group p-6 rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                  <FolderSync className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Always Updated</h3>
                <p className="text-gray-400 text-sm">Regular updates to stay ahead of anti-cheat systems</p>
              </div>

              <div className="group p-6 rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                  <Headphones className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                <p className="text-gray-400 text-sm">Round-the-clock assistance via live chat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-red-500 rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-red-600 rounded-full opacity-80 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-500 rounded-full opacity-50 animate-float" style={{ animationDelay: '3s' }}></div>
      </section>

      {/* About Section */}
      <section className="py-32 relative bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                <span className="text-sm font-medium text-red-400">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Professional Gaming
                <span className="block text-red-500 text-glow">Enhancement</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Enterprise-level security, unmatched reliability, and round-the-clock support for serious gamers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 backdrop-blur-sm bg-black/40">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Undetected Technology</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Military-grade encryption and advanced bypass techniques ensure complete invisibility from anti-cheat systems.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 backdrop-blur-sm bg-black/40">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FolderSync className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Always Updated</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Continuous development and instant updates keep you ahead of the latest game patches and security measures.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 backdrop-blur-sm bg-black/40">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Elite Support</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Dedicated support team available 24/7 through live chat, ensuring immediate assistance whenever needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-32 relative bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                <span className="text-sm font-medium text-red-400">Products</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Premium Gaming
                <span className="block text-red-500 text-glow">Tools</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Professional-grade enhancements designed for competitive gaming excellence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Enhanced Product Cards */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative overflow-hidden rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-500 backdrop-blur-sm bg-black/60">
                  <div className="relative h-56 bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/5 opacity-20"></div>
                    <Gamepad2 className="text-red-500 w-20 h-20 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #001
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">Aimbot Pro V2</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">Advanced precision targeting with customizable settings for competitive FPS gaming</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-500">$29.99</span>
                      <Link href="/products">
                        <Button className="btn-glow px-6 py-2 text-sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative overflow-hidden rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-500 backdrop-blur-sm bg-black/60">
                  <div className="relative h-56 bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/5 opacity-20"></div>
                    <Eye className="text-red-500 w-20 h-20 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #002
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">ESP Wallhack</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">Advanced visualization system for tracking enemies through walls and obstacles</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-500">₹1,999</span>
                      <Link href="/products">
                        <Button className="btn-glow px-6 py-2 text-sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative overflow-hidden rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all duration-500 backdrop-blur-sm bg-black/60">
                  <div className="relative h-56 bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/5 opacity-20"></div>
                    <Zap className="text-red-500 w-20 h-20 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #003
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">No Recoil Script</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">Eliminate weapon recoil patterns for perfect accuracy and control</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-500">৳1,500</span>
                      <Link href="/products">
                        <Button className="btn-glow px-6 py-2 text-sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/products">
                <Button className="btn-glow text-lg px-12 py-4 h-14 font-semibold">
                  <Gamepad2 className="mr-3 w-6 h-6" />
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