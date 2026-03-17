import React, { useState, useEffect, useMemo } from "react";
import { Product } from "@/contexts/CartContext";
import { api } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Star, Upload, Sparkles, Loader2 } from "lucide-react";

// ============================================================================
// Prop Type Definitions
// ============================================================================

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

interface ProductFormProps {
  product: Product | null;
  onSave: (formData: any) => void;
  onCancel: () => void;
  categories: string[];
}

// ============================================================================
// Child Components (Fully Implemented with Types)
// ============================================================================

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <CardDescription>{product.category}</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => onEdit(product)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => onDelete(product._id || product.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-32 object-cover rounded-lg mb-4"
      />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Price:</span>
          <span className="font-semibold">₹{product.price}</span>
        </div>
        <div className="flex justify-between">
          <span>Stock:</span>
          <span className={product.stock > 10 ? "text-green-600" : "text-red-600"}>
            {product.stock} units
          </span>
        </div>
        <div className="flex justify-between">
          <span>Rating:</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel, categories }) => {
  const [formData, setFormData] = React.useState({
    id: undefined as string | undefined,
    name: "", price: "", category: "", description: "", stock: "",
    deliveryTime: "15 mins", image: "", company: "", size: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (product) {
      setFormData({
        id: product._id || product.id,
        name: product.name || "",
        price: product.price.toString(),
        category: product.category || "",
        description: product.description || "",
        stock: product.stock.toString(),
        deliveryTime: product.deliveryTime || "",
        image: product.image || "",
        company: product.company || "",
        size: product.size || "",
      });
    } else {
      setFormData({
        id: undefined,
        name: "", price: "", category: "", description: "", stock: "",
        deliveryTime: "15 mins", image: "", company: "", size: "",
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(currentData => ({ ...currentData, image: base64String }));
        setIsUploading(false);
        toast.success("Image uploaded successfully!");
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIDescription = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a product name first.");
      return;
    }
    setIsGenerating(true);
    try {
      const description = await api.generateProductDescription(formData as any);
      setFormData(currentData => ({ ...currentData, description }));
      toast.success("AI description generated!");
    } catch (error) {
      toast.error("Failed to generate description.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>Fill in the product details below.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" value={formData.name} onChange={handleChange} placeholder="Enter product name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="company">Company/Brand</Label><Input id="company" value={formData.company} onChange={handleChange} placeholder="e.g., Amul, Britannia" /></div>
          <div className="space-y-2"><Label htmlFor="size">Size/Quantity</Label><Input id="size" value={formData.size} onChange={handleChange} placeholder="e.g., 1 Liter, 500g" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="price">Price (₹) *</Label><Input id="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" /></div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={handleSelectChange}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-upload">Product Image</Label>
          <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button variant="outline" className="w-full" onClick={() => document.getElementById('image-upload')?.click()} disabled={isUploading}>
            {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Image</>}
          </Button>
          {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="stock">Stock Quantity</Label><Input id="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="0" /></div>
          <div className="space-y-2"><Label htmlFor="deliveryTime">Delivery Time</Label><Input id="deliveryTime" value={formData.deliveryTime} onChange={handleChange} placeholder="15 mins" /></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <Button variant="outline" size="sm" onClick={generateAIDescription} disabled={isGenerating || !formData.name}>
              {isGenerating ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating...</> : <><Sparkles className="w-3 h-3 mr-1" />AI Generate</>}
            </Button>
          </div>
          <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Product description..." className="min-h-[100px]" />
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={() => onSave(formData)} className="flex-1">Save Product</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </DialogContent>
  );
};

// ============================================================================
// Main ProductManagementTab Component
// ============================================================================
export function ProductManagementTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Biscuits", "Pulses", "Spices", "Cooking Oil", "Snacks"]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchProducts = async () => {
    try {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        api.getProducts(),
        api.getCategories() // Fetch categories from API
      ]);
      setProducts(fetchedProducts);

      // FIX: Extract the 'name' from category objects if they are objects, 
      // and merge with default categories while ensuring uniqueness.
      const categoryNames = fetchedCategories.map((cat: any) =>
        typeof cat === 'string' ? cat : cat.name
      );

      const defaultCategories = ["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Biscuits", "Pulses", "Spices", "Cooking Oil", "Snacks"];
      const uniqueCategories = Array.from(new Set(["All", ...defaultCategories, ...categoryNames]));
      setCategories(uniqueCategories);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products or categories");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (formData: any) => {
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      image: formData.image || 'https://via.placeholder.com/400x300',
      category: formData.category,
      description: formData.description,
      stock: parseInt(formData.stock) || 0,
      deliveryTime: formData.deliveryTime,
      company: formData.company,
      size: formData.size,
      tags: formData.category ? [formData.category.toLowerCase()] : [],
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, productData);
        toast.success("Product updated successfully!");
      } else {
        await api.addNewProduct(productData);
        toast.success("Product added successfully!");
      }
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast.error(`Failed to save product: ${error.message}`);
    }

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!productId) {
      console.error("Delete failed: No Product ID provided");
      toast.error("Delete failed: No Product ID found for this product.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        console.log(`[UI] Initiating deletion for product ID: ${productId}`);
        await api.deleteProduct(productId);
        setProducts(products.filter(p => (p._id || p.id) !== productId));
        toast.success("Product deleted successfully!");
        fetchProducts(); // Refresh list to be sure
      } catch (error: any) {
        console.error(`[UI] Product deletion error for ID ${productId}:`, error);
        toast.error(`Failed to delete product: ${error.message}`);
      }
    }
  };



  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Please enter a category name.");
      return;
    }
    // Check local list first
    if (categories.map(c => c.toLowerCase()).includes(trimmedName.toLowerCase())) {
      toast.error("This category already exists.");
      return;
    }

    try {
      await api.addCategory(trimmedName); // Save to backend
      setCategories(prev => [...prev, trimmedName]);
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
      toast.success(`Category "${trimmedName}" added successfully!`);
    } catch (error) {
      console.error("Failed to add category:", error);
      toast.error("Failed to save category to database.");
    }
  };

  // Duplicate handleImageUpload removed from here. It is now correctly placed inside ProductForm.

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex gap-2">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new category for your products.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Organic Snacks"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            {categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            onEdit={openEditForm}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {isFormOpen && (<ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }} categories={categories.filter(c => c !== 'All')} />)}
      </Dialog>
    </div>
  );
}