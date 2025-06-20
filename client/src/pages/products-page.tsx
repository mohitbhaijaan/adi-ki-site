import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Search, Gamepad2, Eye, Zap, Shield, Target } from "lucide-react";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";
import { useAuth } from "@/hooks/use-auth";

const categoryIcons = {
  "External Panel": Gamepad2,
  "Internal Panel": Shield,
  "Bypass": Target,
  "Silent Aim": Eye,
  "AimKill": Zap,
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { user } = useAuth();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: category === "all" ? undefined : category, search: search || undefined }],
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = search === "" || 
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.id.toString().includes(search);
    
    const matchesCategory = category === "all" || product.category === category;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white relative">
      <ParticlesBackground />

      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-sm border-b border-red-500/30 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-red-500 font-medium">
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
          </div>
        </div>
      </nav>

      {/* Products Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow">
                Gaming <span className="text-red-500 font-mono">Products</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional gaming enhancement tools for competitive players
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, description, or product ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-900 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48 bg-gray-900 border-red-500/30 text-white focus:border-red-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-red-500/30">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="External Panel">External Panel</SelectItem>
                  <SelectItem value="Internal Panel">Internal Panel</SelectItem>
                  <SelectItem value="Bypass">Bypass</SelectItem>
                  <SelectItem value="Silent Aim">Silent Aim</SelectItem>
                  <SelectItem value="AimKill">AimKill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="card-glow animate-pulse">
                    <div className="h-48 bg-gray-800 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-800 rounded mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-800 rounded w-24"></div>
                        <div className="h-10 bg-gray-800 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-400">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {search || category !== "all" 
                    ? "Try adjusting your search filters" 
                    : "No products are currently available"}
                </p>
                {(search || category !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                    }}
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || Gamepad2;
                  
                  return (
                    <Card key={product.id} className="card-glow hover:bg-glow transition-all duration-300 group overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
                        <IconComponent className="text-red-500 w-16 h-16" />
                        <div className="absolute top-4 right-4 bg-red-500 text-black px-2 py-1 rounded text-sm font-bold">
                          #{product.id.toString().padStart(4, '0')}
                        </div>
                        <div className="absolute top-4 left-4 bg-black/80 text-red-500 px-2 py-1 rounded text-xs font-medium">
                          {product.category}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h4 className="text-xl font-bold mb-2 text-glow">{product.title}</h4>
                        <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-red-500">
                            {parseFloat(product.price).toFixed(2)} {product.currency}
                          </span>
                          <Button className="btn-glow">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-400">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-900 to-black py-12 border-t border-red-500/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Logo className="justify-center mb-4" />
            <p className="text-gray-400">
              © 2024 ADI CHEATS. All rights reserved. | Secure & Professional Gaming Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
