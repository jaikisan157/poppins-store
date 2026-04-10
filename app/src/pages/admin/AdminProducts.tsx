import { useEffect, useState, useRef } from 'react';
import { adminApi, getImageUrl } from '@/lib/api';
import type { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    shortDescription: '',
    category: 'Other',
    isVisible: true,
    isFeatured: false,
    images: [],
    videoUrl: '',
    externalUrl: '',
    techStack: [],
  });

  // Files selected from local device
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getProducts({ search, limit: 50 });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();

      // Append image files from local device
      selectedFiles.forEach((file) => {
        formPayload.append('images', file);
      });

      // Build data object (without files)
      const dataObj = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        isVisible: formData.isVisible,
        isFeatured: formData.isFeatured,
        videoUrl: formData.videoUrl,
        externalUrl: formData.externalUrl,
        techStack: formData.techStack,
        tags: formData.tags || [],
        // Only include existing images if editing (not new file uploads)
        ...(selectedProduct && selectedFiles.length === 0 ? { images: formData.images } : {}),
      };

      formPayload.append('data', JSON.stringify(dataObj));

      if (selectedProduct) {
        await adminApi.updateProduct(selectedProduct._id, formPayload);
        toast.success('Project updated!');
      } else {
        await adminApi.createProduct(formPayload);
        toast.success('Project created!');
      }

      setIsEditDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Project deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      category: product.category,
      isVisible: product.isVisible,
      isFeatured: product.isFeatured,
      images: product.images,
      videoUrl: product.videoUrl || '',
      externalUrl: product.externalUrl || '',
      techStack: product.techStack || [],
      tags: product.tags || [],
    });
    setSelectedFiles([]);
    setFilePreviewUrls([]);
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
      category: 'Other',
      isVisible: true,
      isFeatured: false,
      images: [],
      videoUrl: '',
      externalUrl: '',
      techStack: [],
    });
    setSelectedFiles([]);
    setFilePreviewUrls([]);
  };

  // Handle file selection from device
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);

    // Generate preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_: any, i: number) => i !== index),
    });
  };

  const setExistingThumbnail = (index: number) => {
    if (index === 0) return; // Already thumbnail
    const newImages = [...formData.images];
    const [item] = newImages.splice(index, 1);
    newImages.unshift(item); // Move to front
    setFormData({ ...formData, images: newImages });
  };

  const setNewFileThumbnail = (index: number) => {
    if (index === 0 && formData.images.length === 0) return; // Already thumbnail

    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviewUrls];

    const [fileItem] = newFiles.splice(index, 1);
    const [previewItem] = newPreviews.splice(index, 1);

    newFiles.unshift(fileItem);
    newPreviews.unshift(previewItem);

    setSelectedFiles(newFiles);
    setFilePreviewUrls(newPreviews);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-slate-800 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-1/3" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            No projects found
          </div>
        ) : (
          products.map((product) => (
            <Card key={product._id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    {product.images[0]?.url ? (
                      <img
                        src={getImageUrl(product.images[0]?.url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">{product.name}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant={product.isVisible ? 'secondary' : 'default'}>
                          {product.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </div>
                    </div>

                    {product.shortDescription && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{product.shortDescription}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{product.viewCount || 0} views</span>
                      <span>{product.clickCount || 0} clicks</span>
                      {product.techStack && product.techStack.length > 0 && (
                        <span>{product.techStack.slice(0, 3).join(', ')}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/project/${product._id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
            <DialogTitle>{selectedProduct ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Project Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="My Awesome Project"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Short Description</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="A brief tagline for the project"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Full Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the project, features, whats included..."
                rows={5}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white text-sm resize-y"
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
                <option value="SaaS">SaaS</option>
                <option value="Template">Template</option>
                <option value="Full-Stack App">Full-Stack App</option>
                <option value="Landing Page">Landing Page</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Mobile App">Mobile App</option>
                <option value="API / Backend">API / Backend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* IMAGE UPLOAD FROM DEVICE */}
            <div>
              <label className="text-sm text-slate-400">Images (upload from device) - First image is the thumbnail</label>

              {/* Existing images (when editing) */}
              {formData.images && formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2 mb-2">
                  {formData.images.map((img: any, index: number) => (
                    <div key={index} className="relative group w-24">
                      <img
                        src={getImageUrl(img.url)}
                        alt={img.alt || ''}
                        className={`h-24 w-24 object-cover rounded-lg border-2 ${index === 0 ? 'border-primary' : 'border-slate-700'}`}
                      />
                      {index === 0 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-xs text-primary-foreground px-2 py-0.5 rounded-full font-medium shadow-sm whitespace-nowrap z-10">
                          Thumbnail
                        </div>
                      )}
                      {index !== 0 && (
                         <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded-lg transition-all backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => setExistingThumbnail(index)}
                              className="text-[10px] text-white font-medium bg-primary/80 hover:bg-primary px-3 py-1.5 rounded-md transition-colors"
                            >
                              Set Thumbnail
                            </button>
                         </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md hover:bg-red-600"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New file previews */}
              {filePreviewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 mb-2">
                  <div className="w-full text-xs text-slate-500 font-medium mb-1">New Uploads:</div>
                  {filePreviewUrls.map((url, index) => {
                    // It is the overall thumbnail if there are no existing images and the new preview is index 0
                    const isOverallThumbnail = formData.images?.length === 0 && index === 0;

                    return (
                    <div key={index} className="relative group w-24">
                      <img
                        src={url}
                        alt="Preview"
                        className={`h-24 w-24 object-cover rounded-lg border-2 ${isOverallThumbnail ? 'border-primary' : 'border-primary/30'}`}
                      />
                      {isOverallThumbnail && (
                         <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-xs text-primary-foreground px-2 py-0.5 rounded-full font-medium shadow-sm whitespace-nowrap z-10">
                           Thumbnail
                         </div>
                      )}
                       {!isOverallThumbnail && (
                         <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded-lg transition-all backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => setNewFileThumbnail(index)}
                              className="text-[10px] text-white font-medium bg-primary/80 hover:bg-primary px-3 py-1.5 rounded-md transition-colors text-center"
                            >
                              Move to<br/>Front
                            </button>
                         </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md hover:bg-red-600"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )})}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Images
              </Button>
            </div>

            <div>
              <label className="text-sm text-slate-400">Video URL (YouTube or direct link)</label>
              <Input
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            {/* External URL (Gumroad / Purchase Link) */}
            <div>
              <label className="text-sm text-slate-400">Purchase Link (Gumroad, etc.) *</label>
              <Input
                value={formData.externalUrl || ''}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://gumroad.com/l/your-product"
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">Where users go when they click "Get It Now"</p>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-sm text-slate-400">Tech Stack (comma-separated)</label>
              <Input
                value={(formData.techStack || []).join(', ')}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                placeholder="React, Node.js, MongoDB, Tailwind"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <label className="text-sm text-slate-400">Visible</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <label className="text-sm text-slate-400">Featured</label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {selectedProduct ? 'Update Project' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsEditDialogOpen(false); resetForm(); }}
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
