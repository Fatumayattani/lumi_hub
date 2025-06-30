import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Store, Smartphone, FileText, CreditCard, User, LogOut, Menu, X } from 'lucide-react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import MarketplacePage from './components/MarketplacePage';
import AlgorandWalletProvider from './components/AlgorandWalletProvider';
import { useAuth } from './hooks/useAuth';

type CurrentView = 'landing' | 'login' | 'resetPassword' | 'marketplace' | 'dashboard';

function App() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<CurrentView>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for password reset hash in URL on initial load
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setCurrentView('resetPassword');
      // Clear the hash from URL for security
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Handle initial authentication state only
  useEffect(() => {
    if (!loading) {
      // Only set dashboard view if user is authenticated AND we're still on landing page
      // This prevents overriding user navigation choices
      if (user && currentView === 'landing') {
        setCurrentView('dashboard');
      }
      // If user logs out, redirect to landing page
      if (!user && currentView === 'dashboard') {
        setCurrentView('landing');
      }
    }
  }, [user, loading]); // Removed currentView dependency to prevent navigation override

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('landing');
  };

  const handleNavigateToMarketplace = () => {
    setCurrentView('marketplace');
    setMobileMenuOpen(false);
  };

  const handleNavigateToPublicHomepage = () => {
    setCurrentView('landing');
    setMobileMenuOpen(false);
  };

  const handleMarketplaceBack = () => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
  };

  const handleLoginClick = () => {
    setCurrentView('login');
    setMobileMenuOpen(false);
  };

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
              const sizeClass = className.includes('h-24') ? 'text-4xl' : 
                               className.includes('h-20') ? 'text-3xl' : 
                               className.includes('h-16') ? 'text-2xl' : 
                               className.includes('h-12') ? 'text-xl' : 
                               className.includes('h-10') ? 'text-lg' : 'text-base';
              fallback.className = `logo-fallback ${className.replace('h-', 'h-')} bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center font-bold ${sizeClass} px-3 shadow-lg`;
              fallback.textContent = 'LH';
              fallback.style.minWidth = className.includes('h-24') ? '96px' : 
                                       className.includes('h-20') ? '80px' : 
                                       className.includes('h-16') ? '64px' : 
                                       className.includes('h-12') ? '48px' : 
                                       className.includes('h-10') ? '40px' : 
                                       className.includes('h-8') ? '32px' : '40px';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <Logo className="h-16 mb-4" />
          <p className="text-gray-600 text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Wrap the entire app with AlgorandWalletProvider
  const AppContent = () => {
    // Render based on current view
    switch (currentView) {
      case 'resetPassword':
        return (
          <ResetPasswordPage 
            onBack={() => setCurrentView('landing')} 
            onSuccess={() => setCurrentView('dashboard')}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage 
            onSignOut={handleSignOut}
            onNavigateToMarketplace={handleNavigateToMarketplace}
            onNavigateToPublicHomepage={handleNavigateToPublicHomepage}
          />
        );

      case 'marketplace':
        return (
          <MarketplacePage 
            onBack={handleMarketplaceBack}
          />
        );

      case 'login':
        return (
          <LoginPage 
            onBack={() => setCurrentView('landing')} 
            onLoginSuccess={() => setCurrentView('dashboard')}
          />
        );

      case 'landing':
      default:
        // Landing page for non-authenticated users
        return (
          <div className="min-h-screen bg-white text-charcoal">
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 z-40 transition-all duration-300">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Logo className="h-8 sm:h-10" />
                
                {/* Desktop Navigation */}
                <div className="hidden lg:flex gap-8 items-center">
                  <a href="#features" className="text-gray-700 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105">Features</a>
                  <a href="#pricing" className="text-gray-700 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105">Pricing</a>
                  <button 
                    onClick={handleNavigateToMarketplace}
                    className="text-gray-700 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105"
                  >
                    Marketplace
                  </button>
                  <button 
                    onClick={handleLoginClick}
                    className="text-gray-700 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={handleLoginClick}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Start Selling
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Mobile Navigation Menu */}
              {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-down">
                  <div className="px-4 py-4 space-y-4">
                    <a href="#features" className="block text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">Features</a>
                    <a href="#pricing" className="block text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">Pricing</a>
                    <button 
                      onClick={handleNavigateToMarketplace}
                      className="block w-full text-left text-gray-700 hover:text-orange-500 transition-colors font-medium py-2"
                    >
                      Marketplace
                    </button>
                    <button 
                      onClick={handleLoginClick}
                      className="block w-full text-left text-gray-700 hover:text-orange-500 transition-colors font-medium py-2"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={handleLoginClick}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg mt-4"
                    >
                      Start Selling
                    </button>
                  </div>
                </div>
              )}
            </nav>

            {/* Hero Section */}
            <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50 relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left side - Text content */}
                  <div className="space-y-6 sm:space-y-8 animate-slide-up">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                      The Easiest Way for Creators to
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Sell Digital Products</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-2xl">
                      Fast payments with Algorand blockchain, beautiful storefronts, and instant secure delivery.
                      Start selling your digital products today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        onClick={handleLoginClick}
                        className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>Create Your Store</span>
                        <Store size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                      </button>
                      <button 
                        onClick={handleNavigateToMarketplace}
                        className="group border-2 border-gray-800 text-gray-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>Browse Marketplace</span>
                        <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  {/* Right side - Image */}
                  <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
                      <img 
                        src="/lumi4.png" 
                        alt="Creative team working together" 
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg';
                        }}
                      />
                      {/* Subtle overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-200/40 rounded-full blur-xl animate-bounce-gentle"></div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-300/30 rounded-full blur-2xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 -left-8 w-16 h-16 bg-yellow-200/50 rounded-full blur-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Product Categories Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 bg-gray-900 relative overflow-hidden" id="features">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-12 sm:mb-16 animate-slide-up">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">Start creating. Others already are.</h2>
                  <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto">
                    From beats to brand kits, storyboards to starter guides — creators everywhere are launching digital products people actually want. Ready to join them?
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg"
                    emoji="📘"
                    title="eBooks & Digital Reads"
                    description="Stories that entertain, guides that teach, or manifestos that inspire. Upload your words, design your cover, and share it with the world."
                    tags={["how-to guides", "poetry", "digital zines"]}
                    delay="0s"
                  />
                  
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg"
                    emoji="🖌️"
                    title="Design Assets"
                    description="Mockups, UI kits, icons, fonts, and creative packs for other designers — save them hours with resources that look stunning out of the box."
                    tags={["logo packs", "typography", "Figma templates"]}
                    delay="0.1s"
                  />
                  
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg"
                    emoji="🎥"
                    title="Video Templates & Tools"
                    description="Sell transitions, reels templates, LUTs, or explainer videos. Help creators and marketers make magic without starting from scratch."
                    tags={["After Effects", "reels packs", "promo templates"]}
                    delay="0.2s"
                  />
                  
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg"
                    emoji="🎧"
                    title="Voice & Audio"
                    description="From meditations and voiceovers to audio branding kits — if you speak, record, or mix, there's a space for you here."
                    tags={["hypnosis", "podcast intros", "background loops"]}
                    delay="0.3s"
                  />
                  
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg"
                    emoji="📚"
                    title="Online Courses & Masterclasses"
                    description="Teach your skill in digestible, downloadable formats. Whether it's tech, art, writing, or wellness — someone's ready to learn from you."
                    tags={["crash course", "digital workshop", "masterclass"]}
                    delay="0.4s"
                  />
                  
                  <ProductCategoryCard
                    imageSrc="https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg"
                    emoji="✍️"
                    title="Journals & Mindset Tools"
                    description="Daily journals, affirmation decks, or goal-setting templates — support clarity and focus with printable or digital formats."
                    tags={["productivity", "gratitude", "reflection"]}
                    delay="0.5s"
                  />
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 relative overflow-hidden">
              {/* Background animation */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-700/20 animate-pulse-slow"></div>
              </div>
              
              <div className="max-w-7xl mx-auto text-center relative z-10 animate-slide-up">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Ready to Start Selling?
                </h2>
                <p className="text-lg sm:text-xl text-orange-100 mb-8 sm:mb-12 max-w-2xl mx-auto">
                  Join thousands of creators who are already selling their digital products with Lumi Hub.
                  Accept payments in ALGO and other cryptocurrencies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleLoginClick}
                    className="group bg-white text-orange-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Create Your Store Now</span>
                    <Zap size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                  <button 
                    onClick={handleNavigateToMarketplace}
                    className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Explore Marketplace</span>
                    <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 px-4 sm:px-6 py-12 border-t border-gray-700">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Logo className="h-10 mb-4" />
                  <p className="text-gray-400 leading-relaxed">The easiest way for creators to sell digital products with crypto payments.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-white">Product</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Features</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Pricing</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Testimonials</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-white">Company</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">About</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Blog</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-white">Legal</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Privacy</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Terms</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors duration-300">Security</a></li>
                  </ul>
                </div>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <AlgorandWalletProvider>
      <AppContent />
    </AlgorandWalletProvider>
  );
}

function ProductCategoryCard({ 
  imageSrc, 
  emoji, 
  title, 
  description, 
  tags,
  delay = "0s"
}: { 
  imageSrc: string; 
  emoji: string; 
  title: string; 
  description: string; 
  tags: string[];
  delay?: string;
}) {
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 group border border-gray-200 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="relative overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 text-3xl bg-white/90 rounded-full p-2 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          {emoji}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-300 hover:scale-105"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;