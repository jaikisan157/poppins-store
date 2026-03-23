import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    shortDescription: '',
    price: { current: 0, compareAt: 0, cost: 0 },
    inventory: { quantity: 0, lowStockThreshold: 5, trackQuantity: true },
    category: 'Other',
    isVisible: true,
    isFeatured: false,
    images: [],
    videoUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;

      const response = await adminApi.getProducts(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('data', JSON.stringify(formData));
      if (selectedProduct) {
        await adminApi.updateProduct(selectedProduct._id, fd);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(fd);
        toast.success('Product created');
      }
      setIsEditDialogOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(productId);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const fd = new FormData();
      fd.append('data', JSON.stringify({ isVisible: !product.isVisible }));
      await adminApi.updateProduct(product._id, fd);
      toast.success('Product status updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      inventory: product.inventory,
      category: product.category,
      isVisible: product.isVisible,
      isFeatured: product.isFeatured,
      images: product.images,
      videoUrl: product.videoUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedProduct(null);
    resetForm();
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: { current: 0, compareAt: 0, cost: 0 },
      inventory: { quantity: 0, lowStockThreshold: 5, trackQuantity: true },
      category: 'Other',
      isVisible: true,
      isFeatured: false,
      images: [],
      videoUrl: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            No products found
          </div>
        ) : (
          products.map((product) => (
            <Card key={product._id} className="bg-slate-900 border-slate-800 overflow-hidden">
              <div className="aspect-video bg-slate-800 relative">
                <img
                  src={product.images[0]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {!product.isVisible && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Inactive</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-slate-400">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.isVisible}
                      onCheckedChange={() => handleToggleActive(product)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-white">
                    ₹{product.price.current.toFixed(0)}
                  </span>
                  {product.price.compareAt && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.price.compareAt.toFixed(0)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Stock: {product.inventory.quantity}
                  </span>
                  {product.inventory.quantity <= product.inventory.lowStockThreshold && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/product/${product._id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Short Description</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400">Current Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price.current || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, current: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Compare Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price.compareAt || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, compareAt: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Cost</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price.cost || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: { ...formData.price, cost: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.inventory.quantity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, quantity: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white text-sm"
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Toys">Toys</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Kids">Kids</option>
                  <option value="Health">Health</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-400">Image URLs</label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      images: [...(formData.images || []), { url: '', alt: formData.name || '', isMain: false }],
                    })
                  }
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  + Add Image
                </button>
              </div>
              {(formData.images?.length === 0) && (
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      images: [{ url: '', alt: formData.name || '', isMain: true }],
                    })
                  }
                  className="border border-dashed border-slate-600 rounded-md p-4 text-center text-sm text-slate-500 cursor-pointer hover:border-slate-400 transition-colors"
                >
                  Click to add an image URL
                </div>
              )}
              <div className="space-y-2">
                {(formData.images || []).map((img: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs text-slate-500 w-5">{idx + 1}.</span>
                    <Input
                      value={img.url || ''}
                      onChange={(e) => {
                        const updated = [...formData.images];
                        updated[idx] = { ...updated[idx], url: e.target.value, isMain: idx === 0 };
                        setFormData({ ...formData, images: updated });
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="bg-slate-800 border-slate-700 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.images.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, images: updated });
                      }}
                      className="text-red-400 hover:text-red-300 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {formData.images?.length > 0 && (
                <p className="text-[11px] text-slate-500 mt-1">First image will be the main product image.</p>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="text-sm text-slate-400">Video URL (YouTube / Direct link)</label>
              <Input
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
                <span className="text-sm">Featured</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {selectedProduct ? 'Update Product' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
