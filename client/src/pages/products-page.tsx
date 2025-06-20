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

      {/* Enhanced Product View Dialog */}
      <Dialog open={isProductViewDialogOpen} onOpenChange={setIsProductViewDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-red-500/40 max-w-4xl max-h-[90vh] overflow-y-auto card-glow">
          <DialogHeader className="border-b border-red-500/20 pb-4">
            <DialogTitle className="text-glow text-2xl font-bold flex items-center gap-3">
              <Eye className="w-6 h-6 text-red-500" />
              Product Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information and preview of this gaming product
            </DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-8 pt-4">
              {/* Header Section with ID and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-red-500/10 to-transparent p-4 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      #{viewingProduct.id.toString().padStart(4, '0')}
                    </div>
                    <span className="text-red-400 font-semibold">Product ID</span>
                  </div>
                  <p className="text-gray-300 text-sm">Unique identifier for this product</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-transparent p-4 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant={viewingProduct.isActive ? "default" : "secondary"}
                      className={viewingProduct.isActive ? "bg-green-500 text-white" : "bg-gray-600"}
                    >
                      {viewingProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-green-400 font-semibold">Status</span>
                  </div>
                  <p className="text-gray-300 text-sm">Current availability status</p>
                </div>
              </div>

              {/* Main Product Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Product Details */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-red-500/10 backdrop-blur-sm">
                    <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Product Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Title</label>
                        <div className="bg-black/30 p-3 rounded border border-gray-700 text-white font-medium">
                          {viewingProduct.title}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Description</label>
                        <div className="bg-black/30 p-4 rounded border border-gray-700 text-gray-300 max-h-32 overflow-y-auto leading-relaxed">
                          {viewingProduct.description}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Price</label>
                          <div className="bg-gradient-to-r from-red-500/20 to-red-500/5 p-3 rounded border border-red-500/30 text-red-400 font-bold text-lg">
                            ${parseFloat(viewingProduct.price).toFixed(2)} {viewingProduct.currency}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
                          <div className="bg-black/30 p-3 rounded border border-gray-700 text-gray-300 font-medium">
                            {viewingProduct.category}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Created Date</label>
                        <div className="bg-black/30 p-3 rounded border border-gray-700 text-gray-300">
                          {new Date(viewingProduct.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-lg border border-red-500/10 backdrop-blur-sm">
                    <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Product Images
                    </h3>
                    
                    {viewingProduct.images && viewingProduct.images.length > 0 ? (
                      <div className="space-y-4">
                        {viewingProduct.images.map((image, index) => (
                          <div key={index} className="bg-black/30 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative">
                              <img
                                src={image}
                                alt={`${viewingProduct.title} - Image ${index + 1}`}
                                className="max-w-full max-h-full object-contain rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="text-center p-8">
                                        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                        </div>
                                        <p class="text-red-400 font-medium">Image Preview</p>
                                        <p class="text-gray-500 text-sm mt-1">Image ${index + 1}</p>
                                        <p class="text-gray-600 text-xs mt-2 break-all">${image}</p>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                            <div className="p-3 bg-black/20 border-t border-gray-700">
                              <p className="text-gray-400 text-sm font-medium">Image {index + 1}</p>
                              <p className="text-gray-600 text-xs mt-1 break-all">{image}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/30 rounded-lg border border-gray-700 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500 font-medium">No Images Available</p>
                        <p className="text-gray-600 text-sm mt-1">This product doesn't have any images uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="border-t border-red-500/20 pt-6 mt-8">
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setIsProductViewDialogOpen(false)}
                className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Close
              </Button>
              <Button
                onClick={() => setIsProductViewDialogOpen(false)}
                className="btn-glow bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6"
              >
                Contact for Purchase
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
