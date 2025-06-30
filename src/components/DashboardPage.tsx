import React, { useState, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Store, 
  Package, 
  Palette, 
  BarChart3, 
  Plus,
  Settings,
  Eye,
  Edit,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Home,
  ShoppingCart,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AddProductForm from './AddProductForm';
import OrdersTab from './OrdersTab';

interface DashboardPageProps {
  onSignOut: () => void;
  onNavigateToMarketplace: () => void;
  onNavigateToPublicHomepage: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  file_url: string;
  category: string;
  tags: string[];
  is_published: boolean;
  download_count: number;
  created_at: string;
}

interface Store {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  created_at: string;
}

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
}

function DashboardPage({ onSignOut, onNavigateToMarketplace, onNavigateToPublicHomepage }: DashboardPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isStoreConfigured, setIsStoreConfigured] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'storefront', label: 'Storefront', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch store data
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (storeError) {
        console.error('Error fetching store:', storeError);
      } else if (storeData) {
        setStore(storeData);
        setIsStoreConfigured(true);
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
        // Calculate stats
        const totalProducts = productsData?.length || 0;
        const totalSales = productsData?.reduce((sum, product) => sum + (product.price * product.download_count), 0) || 0;
        const totalOrders = productsData?.reduce((sum, product) => sum + product.download_count, 0) || 0;
        
        setStats({
          totalProducts,
          totalSales,
          totalOrders,
          totalCustomers: totalOrders // Simplified - in real app, you'd track unique customers
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSuccess = () => {
    fetchUserData();
    setShowAddProduct(false);
  };

  const handleStoreSuccess = () => {
    fetchUserData();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } else {
        fetchUserData();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: !currentStatus })
        .eq('id', productId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating product status:', error);
        alert('Failed to update product status. Please try again.');
      } else {
        fetchUserData();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} isStoreConfigured={isStoreConfigured} onAddProduct={() => setShowAddProduct(true)} onGoToStorefront={() => setActiveTab('storefront')} />;
      case 'storefront':
        return <StorefrontTab store={store} onSuccess={handleStoreSuccess} />;
      case 'products':
        if (!isStoreConfigured) {
          return <StoreSetupRequired onGoToStorefront={() => setActiveTab('storefront')} />;
        }
        return (
          <ProductsTab 
            products={products} 
            loading={loading}
            onAddProduct={() => setShowAddProduct(true)}
            onDeleteProduct={handleDeleteProduct}
            onToggleStatus={toggleProductStatus}
          />
        );
      case 'orders':
        if (!isStoreConfigured) {
          return <StoreSetupRequired onGoToStorefront={() => setActiveTab('storefront')} />;
        }
        return <OrdersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab stats={stats} isStoreConfigured={isStoreConfigured} onAddProduct={() => setShowAddProduct(true)} onGoToStorefront={() => setActiveTab('storefront')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <Logo className="h-8" />
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">Creator Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Navigation Buttons */}
            <button
              onClick={onNavigateToPublicHomepage}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-all duration-300 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 hover:scale-105"
              title="Go to Public Homepage"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Homepage</span>
            </button>
            
            <button
              onClick={onNavigateToMarketplace}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-all duration-300 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 hover:scale-105"
              title="View Marketplace"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Marketplace</span>
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* User Info */}
            <div className="flex items-center gap-3 text-gray-700">
              <User size={20} />
              <div className="hidden md:block">
                <p className="font-medium text-sm">{user?.user_metadata?.full_name || 'Creator'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <button 
              onClick={onSignOut}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-all duration-300 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 hover:scale-105"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex relative">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile sidebar header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <Logo className="h-8" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="p-4 lg:p-6 pt-6 lg:pt-6">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 border border-orange-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'storefront' && !isStoreConfigured && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 min-h-screen">
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="animate-fade-in">
          <AddProductForm
            onClose={() => setShowAddProduct(false)}
            onSuccess={handleProductSuccess}
          />
        </div>
      )}
    </div>
  );
}

function OverviewTab({ stats, isStoreConfigured, onAddProduct, onGoToStorefront }: { 
  stats: DashboardStats; 
  isStoreConfigured: boolean;
  onAddProduct: () => void;
  onGoToStorefront: () => void;
}) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        {isStoreConfigured && (
          <button 
            onClick={onAddProduct}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      {/* Store Setup Banner */}
      {!isStoreConfigured && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 animate-bounce-gentle">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Store size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Set up your storefront first</h3>
                <p className="text-gray-600">Configure your store name, description, and logo before adding products.</p>
              </div>
            </div>
            <button
              onClick={onGoToStorefront}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Set Up Store
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales.toFixed(2)}`}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
          borderColor="border-green-200"
          delay="0s"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          color="text-blue-600"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          delay="0.1s"
        />
        <StatCard
          title="Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingBag}
          color="text-purple-600"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          delay="0.2s"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          color="text-orange-600"
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          delay="0.3s"
        />
      </div>

      {/* Quick Actions */}
      {isStoreConfigured && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Add New Product"
              description="Upload and start selling your digital products"
              icon={Package}
              action="Add Product"
              onClick={onAddProduct}
              delay="0s"
            />
            <QuickActionCard
              title="Customize Storefront"
              description="Update your store branding and information"
              icon={Palette}
              action="Customize"
              onClick={onGoToStorefront}
              delay="0.1s"
            />
            <QuickActionCard
              title="View Storefront"
              description="See how your store looks to customers"
              icon={Eye}
              action="Preview"
              onClick={() => {}}
              delay="0.2s"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StoreSetupRequired({ onGoToStorefront }: { onGoToStorefront: () => void }) {
  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <Store size={64} className="mx-auto text-orange-500 mb-4 animate-bounce-gentle" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Set up your storefront first</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Before you can add products, you need to configure your store with a name, description, and logo.
        </p>
        <button 
          onClick={onGoToStorefront}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <Store size={20} />
          Set Up Storefront
        </button>
      </div>
    </div>
  );
}

function StorefrontTab({ store, onSuccess }: { store: Store | null; onSuccess: () => void }) {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState(store?.name || '');
  const [storeDescription, setStoreDescription] = useState(store?.description || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(store?.logo_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!storeName.trim()) {
      setMessage({ type: 'error', text: 'Store name is required.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let logoUrl = store?.logo_url || '';

      // Upload logo if a new file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('store-logos')
          .upload(fileName, logoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
          setLoading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('store-logos')
          .getPublicUrl(uploadData.path);

        logoUrl = publicUrl;
      }

      // Save store data
      const storeData = {
        user_id: user.id,
        name: storeName.trim(),
        description: storeDescription.trim(),
        logo_url: logoUrl
      };

      let error;
      if (store) {
        // Update existing store
        const { error: updateError } = await supabase
          .from('stores')
          .update(storeData)
          .eq('id', store.id)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Create new store
        const { error: insertError } = await supabase
          .from('stores')
          .insert([storeData]);
        error = insertError;
      }

      if (error) {
        console.error('Error saving store:', error);
        setMessage({ type: 'error', text: 'Failed to save store. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Store saved successfully!' });
        onSuccess();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Storefront Setup</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Save Changes
            </>
          )}
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Your Store Name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                rows={3}
                placeholder="Tell customers about your store..."
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Logo</h3>
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex justify-center">
                <img
                  src={logoPreview}
                  alt="Store logo preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-all duration-300 relative group">
                <Upload size={32} className="mx-auto text-gray-400 mb-2 group-hover:text-orange-500 transition-colors duration-300" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ 
  products, 
  loading, 
  onAddProduct, 
  onDeleteProduct, 
  onToggleStatus 
}: { 
  products: Product[]; 
  loading: boolean;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button 
          onClick={onAddProduct}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <Package size={48} className="mx-auto text-gray-400 mb-4 animate-bounce-gentle" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first digital product to your store.</p>
          <button 
            onClick={onAddProduct}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Downloads</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{product.download_count}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onToggleStatus(product.id, product.is_published)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                          product.is_published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {product.file_url && (
                          <a
                            href={product.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                            title="View file"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold text-gray-900">Sales & Analytics</h2>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4 animate-bounce-gentle" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics coming soon</h3>
        <p className="text-gray-600">Track your sales, customer behavior, and store performance.</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="your@email.com"
            />
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, borderColor, delay = "0s" }: {
  title: string;
  value: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: string;
}) {
  return (
    <div 
      className={`bg-white rounded-2xl border ${borderColor} p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, action, onClick, delay = "0s" }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number }>;
  action: string;
  onClick: () => void;
  delay?: string;
}) {
  return (
    <div 
      className="border border-gray-200 rounded-2xl p-4 hover:border-orange-200 hover:bg-orange-50 transition-all duration-300 cursor-pointer hover:scale-105 animate-slide-up"
      onClick={onClick}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon size={24} className="text-orange-500" />
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button className="text-orange-500 font-medium text-sm hover:text-orange-600 transition-colors duration-300">
        {action} →
      </button>
    </div>
  );
}

export default DashboardPage;