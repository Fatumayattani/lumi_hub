import React, { useState } from 'react';
import { X, Upload, DollarSign, Package, FileText, Image, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface AddProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  tags: string;
}

const categories = [
  'eBooks & Digital Reads',
  'Design Assets',
  'Video Templates & Tools',
  'Voice & Audio',
  'Online Courses & Masterclasses',
  'Journals & Mindset Tools',
  'Software & Apps',
  'Photography',
  'Music & Beats',
  'Other'
];

function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: categories[0],
    tags: ''
  });

  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productDownloadFile, setProductDownloadFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductDownloadFile(file);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    if (bucket === 'product-files') {
      // For private files, return the path (not public URL)
      return data.path;
    } else {
      // For public files, return the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return publicUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'Product name is required.' });
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) < 0) {
        setMessage({ type: 'error', text: 'Please enter a valid price.' });
        setLoading(false);
        return;
      }

      if (!productDownloadFile) {
        setMessage({ type: 'error', text: 'Please upload a digital product file.' });
        setLoading(false);
        return;
      }

      // Upload files
      let imageUrl = '';
      let fileUrl = '';

      // Upload product image if provided
      if (productImageFile) {
        try {
          imageUrl = await uploadFile(productImageFile, 'product-images');
        } catch (error) {
          console.error('Error uploading image:', error);
          setMessage({ type: 'error', text: 'Failed to upload product image. Please try again.' });
          setLoading(false);
          return;
        }
      }

      // Upload product file
      try {
        fileUrl = await uploadFile(productDownloadFile, 'product-files');
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage({ type: 'error', text: 'Failed to upload product file. Please try again.' });
        setLoading(false);
        return;
      }

      // Process tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Insert product into database
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            image_url: imageUrl,
            file_url: fileUrl,
            category: formData.category,
            tags: tagsArray,
            is_published: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        setMessage({ type: 'error', text: 'Failed to create product. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Product created successfully!' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <p className="text-sm text-gray-600">Upload your digital product for sale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
            disabled={loading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 animate-slide-down ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package size={16} className="inline mr-2" />
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your product name"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              rows={4}
              placeholder="Describe your product..."
              disabled={loading}
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-2" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Image Upload */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image size={16} className="inline mr-2" />
              Product Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-all duration-300 relative group">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="text-sm text-gray-600">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image size={32} className="mx-auto text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                  <p className="text-sm text-gray-600">Upload product image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
            </div>
          </div>

          {/* Digital Product File Upload */}
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload size={16} className="inline mr-2" />
              Digital Product File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-all duration-300 relative group">
              {productDownloadFile ? (
                <div className="space-y-2">
                  <Upload size={32} className="mx-auto text-green-500" />
                  <p className="text-sm text-gray-900 font-medium">{productDownloadFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(productDownloadFile.size / 1024 / 1024).toFixed(2)} MB - Click to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={32} className="mx-auto text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                  <p className="text-sm text-gray-600">Upload your digital product</p>
                  <p className="text-xs text-gray-500">PDF, ZIP, or other digital files up to 100MB</p>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-2" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="design, template, modern (separate with commas)"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add relevant tags separated by commas to help customers find your product
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Product...
                </div>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;