import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, InsertProduct, insertProductSchema, updateProductSchema, insertAnnouncementSchema, ChatMessage, ChatSession, User, InsertUser, insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Edit, Trash2, Search, MessageSquare, Settings, Users, BarChart3, TrendingUp, DollarSign, Package, Bell, Activity } from "lucide-react";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [newChatMessage, setNewChatMessage] = useState("");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: announcement } = useQuery({
    queryKey: ["/api/announcements/active"],
  });

  const { data: chatMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  // Connect to WebSocket for live chat
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Admin WebSocket connected");
      // Identify as admin
      ws.send(JSON.stringify({
        type: 'admin_join'
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "new_message") {
        // Update messages for the specific session
        const message = data.payload;
        setSessionMessages(prev => ({
          ...prev,
          [message.sessionId]: [...(prev[message.sessionId] || []), message]
        }));
        
        // Show notification for new user messages
        if (!message.isAdmin) {
          toast({
            title: "New message from " + message.username,
            description: message.message,
          });
        }
      }
      
      if (data.type === "admin_sessions") {
        setChatSessions(data.payload);
      }
    };

    ws.onclose = () => {
      console.log("Admin WebSocket disconnected");
    };

    setSocket(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient, toast]);

  // Load chat sessions on component mount
  useEffect(() => {
    const loadChatSessions = async () => {
      try {
        const response = await fetch('/api/chat/sessions');
        if (response.ok) {
          const sessions = await response.json();
          setChatSessions(sessions);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };

    loadChatSessions();
  }, []);

  // Load messages for selected session
  useEffect(() => {
    if (selectedSession) {
      const loadMessages = async () => {
        try {
          const response = await fetch(`/api/chat/sessions/${selectedSession}/messages`);
          if (response.ok) {
            const messages = await response.json();
            setSessionMessages(prev => ({
              ...prev,
              [selectedSession]: messages
            }));
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };

      loadMessages();
    }
  }, [selectedSession]);

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      toast({ title: "Product created successfully" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      const res = await apiRequest("POST", "/api/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/active"] });
      toast({ title: "Announcement updated successfully" });
    },
  });

  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(editingProduct ? updateProductSchema : insertProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      currency: "USD",
      category: "External Panel",
      images: [],
      isActive: true,
    },
  });

  const announcementForm = useForm({
    defaultValues: {
      message: announcement?.message || "",
    },
  });

  const onProductSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const onAnnouncementSubmit = (data: any) => {
    updateAnnouncementMutation.mutate({ message: data.message });
  };

  const sendAdminMessage = (message: string) => {
    if (!socket || !message.trim() || !selectedSession) return;

    const messageData = {
      type: "chat_message",
      payload: {
        sessionId: selectedSession,
        userId: user?.id || null,
        username: "Admin",
        message: message.trim(),
        isAdmin: true,
      },
    };

    socket.send(JSON.stringify(messageData));
  };

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const totalRevenue = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  const recentMessages = chatMessages.slice(-5);
  const pendingMessages = chatMessages.filter(m => !m.isAdmin).length;

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
    });
    setIsProductDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      title: "",
      description: "",
      price: "0",
      currency: "USD",
      category: "External Panel",
      images: [],
      isActive: true,
    });
    setIsProductDialogOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-red-500/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Welcome, {user?.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-glow">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your gaming products and announcements</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-900 border-red-500/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-red-500">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-red-500">
              <Bell className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-red-500">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat {pendingMessages > 0 && <Badge className="ml-1 bg-red-500">{pendingMessages}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-500">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Products</p>
                      <p className="text-2xl font-bold text-red-500">{totalProducts}</p>
                    </div>
                    <Package className="w-8 h-8 text-red-500/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Products</p>
                      <p className="text-2xl font-bold text-green-500">{activeProducts}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Value</p>
                      <p className="text-2xl font-bold text-yellow-500">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Pending Messages</p>
                      <p className="text-2xl font-bold text-blue-500">{pendingMessages}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-glow flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentMessages.length === 0 ? (
                      <p className="text-gray-400 text-sm">No recent messages</p>
                    ) : (
                      recentMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${msg.isAdmin ? 'text-red-400' : 'text-blue-400'}`}>
                                {msg.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-glow flex items-center">
                    <Package className="w-5 h-5 mr-2 text-red-500" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                        <div>
                          <p className="text-sm font-medium text-white">{product.title}</p>
                          <p className="text-xs text-gray-400">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-500">{product.price} {product.currency}</p>
                          <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <p className="text-gray-400 text-sm">No products available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-glow">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={handleAddProduct} className="btn-glow h-20 flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Add Product
                  </Button>
                  <Button 
                    onClick={() => {
                      announcementForm.setValue("message", "🔥 Special offer - Contact us for exclusive deals!");
                      updateAnnouncementMutation.mutate({ message: "🔥 Special offer - Contact us for exclusive deals!" });
                    }}
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10 h-20 flex-col"
                  >
                    <Bell className="w-6 h-6 mb-2" />
                    Quick Announcement
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 h-20 flex-col w-full">
                      <Activity className="w-6 h-6 mb-2" />
                      View Site
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => queryClient.invalidateQueries()}
                    variant="outline" 
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10 h-20 flex-col"
                  >
                    <TrendingUp className="w-6 h-6 mb-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-red-500/30 text-white"
                />
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddProduct} className="btn-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-red-500/30 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-glow">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-800 border-red-500/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-red-500/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-red-500/30">
                                  <SelectItem value="External Panel">External Panel</SelectItem>
                                  <SelectItem value="Internal Panel">Internal Panel</SelectItem>
                                  <SelectItem value="Bypass">Bypass</SelectItem>
                                  <SelectItem value="Silent Aim">Silent Aim</SelectItem>
                                  <SelectItem value="AimKill">AimKill</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="bg-gray-800 border-red-500/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" className="bg-gray-800 border-red-500/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-red-500/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-red-500/30">
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="INR">INR</SelectItem>
                                  <SelectItem value="BDT">BDT</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsProductDialogOpen(false)}
                          className="border-gray-600 text-gray-400"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="btn-glow"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        >
                          {editingProduct ? "Update" : "Create"} Product
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {productsLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <Card className="card-glow">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchTerm ? "Try adjusting your search" : "Start by adding your first product"}
                    </p>
                    <Button onClick={handleAddProduct} className="btn-glow">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="card-glow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-glow">{product.title}</h3>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              #{product.id.toString().padStart(4, '0')}
                            </span>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-red-500 font-bold">
                              {parseFloat(product.price).toFixed(2)} {product.currency}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.isActive 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-glow flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Announcement Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...announcementForm}>
                  <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-4">
                    <FormField
                      control={announcementForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Announcement Message</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter your announcement message..."
                              className="bg-gray-800 border-red-500/30"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="btn-glow"
                      disabled={updateAnnouncementMutation.isPending}
                    >
                      Update Announcement
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-glow flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Live Chat Management
                  {pendingMessages > 0 && (
                    <Badge className="ml-2 bg-red-500 animate-pulse">{pendingMessages} New</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages Display */}
                  <div className="h-96 bg-gray-900 rounded-lg p-4 overflow-y-auto border border-red-500/30">
                    <div className="space-y-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-red-500 mx-auto mb-3 opacity-50" />
                          <p className="text-gray-400">No messages yet</p>
                          <p className="text-sm text-gray-500">Messages from users will appear here in real-time</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg ${
                              msg.isAdmin 
                                ? 'bg-red-500/20 border border-red-500/30 ml-8' 
                                : 'bg-gray-800 border border-gray-700 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-medium ${
                                msg.isAdmin ? 'text-red-400' : 'text-blue-400'
                              }`}>
                                {msg.username}
                                {msg.isAdmin && <span className="ml-1 text-xs bg-red-500 px-1 rounded">ADMIN</span>}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-white text-sm">{msg.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Reply Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const message = formData.get('message') as string;
                      if (message.trim()) {
                        sendAdminMessage(message);
                        (e.target as HTMLFormElement).reset();
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      name="message"
                      placeholder="Type your admin response..."
                      className="flex-1 bg-gray-800 border-red-500/30 focus:border-red-500"
                    />
                    <Button type="submit" className="btn-glow">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </form>

                  {/* Quick Responses */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendAdminMessage("Hello! How can I help you today?")}
                      className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                    >
                      👋 Greeting
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendAdminMessage("Thank you for your interest! Please check our products page for available cheats.")}
                      className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                    >
                      📦 Products
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendAdminMessage("All our cheats are undetected and regularly updated. Contact us for more details.")}
                      className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                    >
                      🔒 Security
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendAdminMessage("Thank you! Feel free to reach out if you have any other questions.")}
                      className="border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500"
                    >
                      ✅ Closing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-glow flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Site Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Site Title</label>
                    <Input 
                      defaultValue="ADI CHEATS" 
                      className="bg-gray-800 border-red-500/30"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Site Status</label>
                    <Select defaultValue="online">
                      <SelectTrigger className="bg-gray-800 border-red-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="online">🟢 Online</SelectItem>
                        <SelectItem value="maintenance">🟡 Maintenance</SelectItem>
                        <SelectItem value="offline">🔴 Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Default Currency</label>
                    <Select defaultValue="USD">
                      <SelectTrigger className="bg-gray-800 border-red-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-glow flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Admin Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Administrator</p>
                        <p className="text-sm text-gray-400">Username: {user?.username}</p>
                        <p className="text-sm text-gray-400">Single Owner Access</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Login Session</label>
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <span className="text-sm text-green-400">Active</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => logoutMutation.mutate()}
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-glow flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">99.9%</div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{chatMessages.length}</div>
                    <div className="text-sm text-gray-400">Total Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{totalProducts}</div>
                    <div className="text-sm text-gray-400">Products Listed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">24/7</div>
                    <div className="text-sm text-gray-400">Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
