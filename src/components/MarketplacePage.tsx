import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, ShoppingBag, Star, Download, Eye, DollarSign, Package, Users, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductPurchaseModal from './ProductPurchaseModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  file_url: string;
  category: string;
  tags: string[];
  download_count: number;
  created_at: string;
  user_id: string;
}

interface MarketplacePageProps {
  onBack: () => void;
}

function MarketplacePage({ onBack }: MarketplacePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = [
    'All',
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

  // Logo component with fallback
  const Logo = ({ className = "h-8" }: { className?: string }) => {
    return (
      <div className={`${className} flex items-center transition-transform duration-300 hover:scale-105`}>
        <img 
          src="/ll.png" 
          alt="Lumi Hub" 
          className={`${className} transition-all duration-300`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.logo-fallback')) {
              const fallback = document.createElement('div');
              const sizeClass = className.includes('h-10') ? 'text-lg' : 
                               className.includes('h-8') ? 'text-base' : 
                               className.includes('h-6') ? 'text-sm' : 'text-base';
              fallback.className = `logo-fallback ${className.replace('h-', 'h-')} bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center font-bold ${sizeClass} px-3 shadow-lg`;
              fallback.textContent = 'LH';
              fallback.style.minWidth = className.includes('h-10') ? '40px' : 
                                       className.includes('h-8') ? '32px' : 
                                       className.includes('h-6') ? '24px' : '40px';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return b.download_count - a.download_count;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setSelectedProduct(null);
    // Refresh products to update download counts
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <Logo className="h-16 mb-4" />
          <p className="text-gray-600 text-lg">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <Logo className="h-8 sm:h-10" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Marketplace</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Package size={16} />
              <span className="text-sm font-medium hidden sm:inline">{products.length} Products</span>
              <span className="text-sm font-medium sm:hidden">{products.length}</span>
            </div>
            
            {/* Mobile filter button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-up">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Discover Amazing Digital Products
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            From creative assets to educational content, find the perfect digital products created by talented creators worldwide.
            Pay securely with Algorand cryptocurrency.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filters Row - Desktop */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {filtersOpen && (
              <div className="sm:hidden space-y-4 animate-slide-down">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Package size={48} className="mx-auto text-gray-400 mb-4 animate-bounce-gentle" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All' ? 'No products found' : 'No products available'}
            </h3>
            <p className="text-gray-600 px-4">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Be the first to add a product to the marketplace!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                delay={`${index * 0.1}s`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="animate-fade-in">
          <ProductPurchaseModal
            product={selectedProduct}
            onClose={() => {
              setShowPurchaseModal(false);
              setSelectedProduct(null);
            }}
            onSuccess={handlePurchaseSuccess}
          />
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onClick, delay = "0s" }: { product: Product; onClick: () => void; delay?: string }) {
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getImageSrc = (imageUrl: string) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Fallback to a placeholder image
    return 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer group hover:scale-105 animate-slide-up"
      onClick={onClick}
      style={{ animationDelay: delay }}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={getImageSrc(product.image_url)}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            product.price === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
            Click to Purchase
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {product.description || 'No description available'}
          </p>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full transition-colors duration-300 hover:bg-orange-50 hover:text-orange-600">
            {product.category}
          </span>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full transition-all duration-300 hover:bg-orange-100"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{product.download_count} downloads</span>
          </div>
          <div className="flex items-center gap-1 text-orange-500 group-hover:text-orange-600 transition-colors duration-300">
            <ShoppingBag size={14} />
            <span>Buy Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketplacePage;