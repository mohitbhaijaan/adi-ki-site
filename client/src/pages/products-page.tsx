import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  const [isProductViewDialogOpen, setIsProductViewDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsProductViewDialogOpen(true);
  };

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
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button className="btn-glow">Admin Panel</Button>
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

            {/* Improved Filters Layout */}
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-300">Products</h2>
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                  {filteredProducts.length} found
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-gray-900 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 text-sm"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-40 h-10 bg-gray-900 border-red-500/30 text-white focus:border-red-500 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-500/30">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="External Panel">External</SelectItem>
                    <SelectItem value="Internal Panel">Internal</SelectItem>
                    <SelectItem value="Bypass">Bypass</SelectItem>
                    <SelectItem value="Silent Aim">Silent Aim</SelectItem>
                    <SelectItem value="AimKill">AimKill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="card-glow animate-pulse overflow-hidden">
                    <div className="h-40 bg-gray-800/50 border-b border-red-500/20"></div>
                    <CardContent className="p-4">
                      <div className="h-5 bg-gray-800/50 rounded mb-2"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800/50 rounded mb-4 w-3/4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-800/50 rounded w-16"></div>
                        <div className="h-7 bg-gray-800/50 rounded w-12"></div>
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || Gamepad2;
                  
                  return (
                    <Card key={product.id} className="card-glow hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <div className="relative h-40 bg-gradient-to-br from-red-500/15 to-red-700/15 border-b border-red-500/20 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="text-red-500 w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <div className="absolute top-3 right-3 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold">
                          #{product.id.toString().padStart(4, '0')}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/70 text-red-400 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                          {product.category}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="text-lg font-bold mb-2 text-white group-hover:text-red-400 transition-colors duration-300 line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xl font-bold text-red-500">
                              {parseFloat(product.price).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 ml-1">
                              {product.currency}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            className="btn-glow text-xs px-3 py-1"
                            onClick={() => handleViewProduct(product)}
                          >
                            View
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

      {/* Product View Dialog - Recreated */}
      <Dialog open={isProductViewDialogOpen} onOpenChange={setIsProductViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-red-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-glow flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              Product Details
            </DialogTitle>
            <DialogDescription>View complete product information</DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Product ID</label>
                  <div className="bg-gray-800 p-2 rounded text-red-400 font-bold">
                    #{viewingProduct.id.toString().padStart(4, '0')}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="bg-gray-800 p-2 rounded">
                    <Badge variant={viewingProduct.isActive ? "default" : "secondary"}>
                      {viewingProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <div>
                <label className="text-sm text-gray-400">Title</label>
                <div className="bg-gray-800 p-3 rounded text-white">
                  {viewingProduct.title}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <div className="bg-gray-800 p-3 rounded text-gray-300 max-h-20 overflow-y-auto">
                  {viewingProduct.description}
                </div>
              </div>
              
              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Price</label>
                  <div className="bg-gray-800 p-3 rounded text-red-500 font-bold">
                    ${parseFloat(viewingProduct.price).toFixed(2)} {viewingProduct.currency}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Category</label>
                  <div className="bg-gray-800 p-3 rounded text-gray-300">
                    {viewingProduct.category}
                  </div>
                </div>
              </div>
              
              {/* Created Date */}
              <div>
                <label className="text-sm text-gray-400">Created Date</label>
                <div className="bg-gray-800 p-3 rounded text-gray-300">
                  {new Date(viewingProduct.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {/* Images */}
              {viewingProduct.images && viewingProduct.images.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Images</label>
                  <div className="space-y-2">
                    {viewingProduct.images.map((image, index) => (
                      <div key={index} className="bg-gray-800 rounded border border-gray-700">
                        <div className="aspect-video bg-black/50 flex items-center justify-center">
                          <img
                            src={image}
                            alt={`Product Image ${index + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const container = img.parentElement;
                              if (container) {
                                container.innerHTML = `
                                  <div class="text-center p-4">
                                    <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                    <p class="text-red-400 text-sm">Image ${index + 1}</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                        <div className="p-2 border-t border-gray-700">
                          <p className="text-xs text-gray-500">Image {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => setIsProductViewDialogOpen(false)}
              className="btn-glow"
            >
              Contact for Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
