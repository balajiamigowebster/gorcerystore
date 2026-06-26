import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import HeroBanner from './components/HeroBanner';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AddressModal from './components/AddressModal';
import LoginModal from './components/LoginModal';
import OrderTracker from './components/OrderTracker';
import AdminDashboard from './components/AdminDashboard';
import CategoryProductRow from './components/CategoryProductRow';
import MobileMenuDrawer from './components/MobileMenuDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import { Sparkles, HelpCircle, Shield } from 'lucide-react';

function AppContent() {
  const { user } = useCart();
  
  // Navigation
  const [activePage, setActivePage] = useState('home'); // 'home', 'tracker', 'admin'
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeSubHeaderTab, setActiveSubHeaderTab] = useState('all');

  // Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawers
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  // Tip selected during checkout
  const [driverTip, setDriverTip] = useState(0);

  // Loading States
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');

  // 1. Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Categories fetch failed');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch Products (depends on active category or search query)
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      setProductError('');
      try {
        let url = '/api/products';
        const params = [];
        if (activeCategory) {
          params.push(`category=${activeCategory}`);
        } else if (searchQuery) {
          params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Products fetch failed');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductError('Failed to load products. Check server connectivity.');
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, [activeCategory, searchQuery]);


  // 3. URL Router - Initialize state from URL on mount & handle popstate browser navigation
  useEffect(() => {
    const initFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const catId = params.get('category');
      const prodId = params.get('product');
      const search = params.get('search');
      const page = params.get('page');
      const orderId = params.get('orderId');

      if (page === 'admin') {
        setActivePage('admin');
      } else if (page === 'tracker') {
        setActivePage('tracker');
        if (orderId) setSelectedOrderId(Number(orderId));
      } else {
        setActivePage('home');
      }

      if (catId) {
        setActiveCategory(Number(catId));
      } else {
        setActiveCategory(null);
      }

      if (search) {
        setSearchQuery(decodeURIComponent(search));
      } else {
        setSearchQuery('');
      }

      if (prodId) {
        fetch(`/api/products/${prodId}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Product not found');
          })
          .then(prod => {
            setDetailProduct(prod);
          })
          .catch(err => {
            console.error('Error fetching deep-linked product:', err);
            setDetailProduct(null);
          });
      } else {
        setDetailProduct(null);
      }
    };

    // Run once on initial mount
    initFromUrl();

    // Listen to browser Back/Forward navigation
    window.addEventListener('popstate', initFromUrl);
    return () => window.removeEventListener('popstate', initFromUrl);
  }, []);

  // 4. URL Router - Synchronize React states to Browser URL query params
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    // Skip updating URL on mount (handled by mount init effect)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (activePage !== 'home') {
      params.set('page', activePage);
      if (activePage === 'tracker' && selectedOrderId) {
        params.set('orderId', selectedOrderId);
      }
    } else {
      if (detailProduct) {
        params.set('product', detailProduct.id);
      } else {
        if (activeCategory) {
          params.set('category', activeCategory);
        }
        if (searchQuery) {
          params.set('search', searchQuery);
        }
      }
    }

    const newQueryString = params.toString();
    const currentQueryString = window.location.search.replace(/^\?/, '');

    if (newQueryString !== currentQueryString) {
      const newUrl = newQueryString ? `/?${newQueryString}` : '/';
      window.history.pushState(null, '', newUrl);
    }
  }, [activeCategory, searchQuery, activePage, selectedOrderId, detailProduct]);

  // 5. Sync subheader active tab when activeCategory is loaded/changed via URL deep-linking
  useEffect(() => {
    if (activeCategory === null) {
      setActiveSubHeaderTab('all');
    } else if (categories.length > 0) {
      const catName = categories.find(c => c.id === activeCategory)?.name;
      if (catName === 'Fruits & Vegetables') setActiveSubHeaderTab('fresh');
      else if (catName === 'Zepto Cafe') setActiveSubHeaderTab('cafe');
      else setActiveSubHeaderTab('all');
    }
  }, [activeCategory, categories]);

  // Handle category selection
  const handleSelectCategory = (catId) => {
    setSearchQuery(''); // Reset search when clicking category
    setActiveCategory(catId);
    
    // Sync subheader active tab
    if (catId === null) {
      setActiveSubHeaderTab('all');
    } else {
      const catName = categories.find(c => c.id === catId)?.name;
      if (catName === 'Fruits & Vegetables') setActiveSubHeaderTab('fresh');
      else if (catName === 'Zepto Cafe') setActiveSubHeaderTab('cafe');
      else setActiveSubHeaderTab('all');
    }
    setActivePage('home'); // Go to home if they were on another page
  };

  // Handle search query
  const handleSearch = (query) => {
    setActiveCategory(null); // Reset category when searching
    setSearchQuery(query);
    
    // Sync subheader active tab
    if (query.toLowerCase() === 'toys') setActiveSubHeaderTab('toys');
    else if (query.toLowerCase() === 'electronics') setActiveSubHeaderTab('electronics');
    else if (query.toLowerCase() === 'mobile' || query.toLowerCase() === 'mobiles') setActiveSubHeaderTab('mobiles');
    else if (query.toLowerCase() === 'soap' || query.toLowerCase() === 'beauty') setActiveSubHeaderTab('beauty');
    else if (query.toLowerCase() === 'tshirt' || query.toLowerCase() === 'fashion') setActiveSubHeaderTab('fashion');
    else setActiveSubHeaderTab('all');

    setActivePage('home');
  };

  // Handle Checkout initiation from Cart
  const handleOpenCheckout = (tip) => {
    setDriverTip(tip);
    setCartOpen(false);
    
    // Auth Check: must be logged in to checkout
    if (!user) {
      setLoginOpen(true);
    } else {
      setCheckoutOpen(true);
    }
  };

  // Handle Order Placed successfully
  const handleOrderPlaced = (orderId) => {
    setCheckoutOpen(false);
    setSelectedOrderId(orderId);
    setActivePage('tracker');
  };

  const handleSelectSubHeaderTab = (tabId) => {
    setActiveSubHeaderTab(tabId);
    
    // Map SubHeader tabs to DB queries or search keys
    if (tabId === 'all') {
      setActiveCategory(null);
      setSearchQuery('');
    } else if (tabId === 'cafe') {
      // Find Cafe ID in categories
      const cafeCat = categories.find(c => c.name === 'Zepto Cafe');
      if (cafeCat) {
        setActiveCategory(cafeCat.id);
        setSearchQuery('');
      }
    } else if (tabId === 'fresh') {
      const freshCat = categories.find(c => c.name === 'Fruits & Vegetables');
      if (freshCat) {
        setActiveCategory(freshCat.id);
        setSearchQuery('');
      }
    } else if (tabId === 'toys') {
      setActiveCategory(null);
      setSearchQuery('toys');
    } else if (tabId === 'electronics') {
      setActiveCategory(null);
      setSearchQuery('electronics');
    } else if (tabId === 'mobiles') {
      setActiveCategory(null);
      setSearchQuery('mobile');
    } else if (tabId === 'beauty') {
      setActiveCategory(null);
      setSearchQuery('soap');
    } else if (tabId === 'fashion') {
      setActiveCategory(null);
      setSearchQuery('tshirt');
    } else if (tabId === 'home') {
      // Atta & Dals or clean categories
      const homeCat = categories.find(c => c.name === 'Atta, Rice, Oil & Dals');
      if (homeCat) {
        setActiveCategory(homeCat.id);
        setSearchQuery('');
      }
    }
    setActivePage('home');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 w-full">
      
      {/* Header */}
      {activePage !== 'admin' && (
        <Header
          onOpenCart={() => setCartOpen(true)}
          onNavigate={(page) => {
            setActivePage(page);
            if (page === 'home') {
              setActiveCategory(null);
              setSearchQuery('');
              setActiveSubHeaderTab('all');
            }
          }}
          onSearch={handleSearch}
          currentSearch={searchQuery}
          onOpenAddressModal={() => setAddressOpen(true)}
          onOpenLoginModal={() => setLoginOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      )}

      {/* SubHeader Categories Navigation */}
      {activePage === 'home' && !loadingCategories && (
        <SubHeader 
          activeTab={activeSubHeaderTab}
          onSelectTab={handleSelectSubHeaderTab}
        />
      )}

      {/* Main Pages Router */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <div className="container pb-12">
            
            {/* Categories Selector */}
            {loadingCategories ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <CategoryGrid
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {/* Product Catalog Grid */}
            <div className="mt-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-purple-950">
                  {searchQuery 
                    ? `Search Results for "${searchQuery}"` 
                    : activeCategory 
                      ? categories.find(c => c.id === activeCategory)?.name 
                      : 'Trending Near You'}
                </h3>
                {products.length > 0 && (
                  <span className="text-xs font-bold text-gray-400 bg-white border border-gray-150 px-2.5 py-1 rounded-full">
                    {products.length} Items found
                  </span>
                )}
              </div>

              {loadingProducts ? (
                /* Grid Skeleton Loader */
                <div className="grid grid-responsive">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 h-64 flex flex-col justify-between animate-pulse">
                      <div className="bg-gray-100 h-28 w-full rounded-xl"></div>
                      <div className="space-y-2 mt-3">
                        <div className="bg-gray-100 h-4 w-3/4 rounded"></div>
                        <div className="bg-gray-100 h-3 w-1/2 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="bg-gray-100 h-6 w-1/3 rounded"></div>
                        <div className="bg-gray-100 h-8 w-1/3 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : productError ? (
                <div className="bg-red-50 text-red-755 p-6 rounded-2xl text-center border border-red-100">
                  <p className="font-semibold">{productError}</p>
                </div>
              ) : products.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-xs max-w-md mx-auto my-6">
                  <div className="bg-purple-50 text-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">No items matched your search</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[280px] mx-auto">
                    Try searching for common terms like "kurkure", "milk", "tomato" or browse the categories above.
                  </p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory(null); setActiveSubHeaderTab('all'); }}
                    className="mt-4 bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (activeCategory !== null || searchQuery !== '') ? (
                /* Single Grid View for Search/Category filter */
                <div className="grid grid-responsive">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onOpenDetails={(p) => setDetailProduct(p)} />
                  ))}
                </div>
              ) : (
                /* Split Categories View on Homepage (Horizontal Scrolls with Carousel arrows) */
                <div className="flex flex-col gap-8">
                  {categories.map((cat) => {
                    const catProducts = products.filter((p) => p.category_id === cat.id);
                    if (catProducts.length === 0) return null;
                    return (
                      <CategoryProductRow
                        key={cat.id}
                        cat={cat}
                        catProducts={catProducts}
                        onSelectCategory={handleSelectCategory}
                        onOpenDetails={(p) => setDetailProduct(p)}
                      />
                    );
                  })}
                </div>
              )}

              {/* SEO Keyword Copy Block */}
              {!activeCategory && !searchQuery && (
                <div className="mt-16 bg-white border border-gray-100 rounded-3xl p-8 text-left shadow-xs">
                  <h2 className="text-lg font-extrabold text-purple-950 mb-3">
                    Amigocart - India's Fastest Online Grocery Delivery App
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Welcome to <strong>Amigocart</strong>, your premium online supermarket delivering daily essentials to your doorstep in 10 minutes. We specialize in bringing you farm-fresh fruits & vegetables, fresh milk, organic set curd, bakery bread, eggs, and groceries with maximum speed and convenience.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-50">
                    <div>
                      <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-2">
                        Fresh Fruits & Vegetables
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Buy fresh fruits online and order organic vegetables online. We source directly from local farms in Bangalore and Chennai to ensure premium quality.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-2">
                        10-Minute Grocery Delivery
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Need milk, bread, eggs, or snacks instantly? Amigocart's hyperlocal delivery fleet ensures your daily essentials arrive in under 10 minutes.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-2">
                        Organic Dairy & Staples
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Shop popular items like Akshayakalpa set curd, Nandini ghee, and daily essentials. Choose from multiple weight options (500g, 1kg, 2kg) to fit your family's needs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activePage === 'tracker' && (
          <OrderTracker
            orderId={selectedOrderId}
            onBackToHome={() => {
              setSelectedOrderId(null);
              setActivePage('home');
              setActiveSubHeaderTab('all');
            }}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboard
            onBackToHome={() => setActivePage('home')}
          />
        )}
      </main>

      {/* Footer Banner */}
      {activePage !== 'admin' && (
        <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-xs text-gray-500">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-medium">© 2026 Amigocart. All mock rights reserved. Designed and developed by amigowebster.</span>
            <div className="flex gap-4 font-bold text-purple-700">
              <a href="#" className="hover:underline flex items-center gap-1"><Shield size={12} /> Privacy Policy</a>
              <a href="#" className="hover:underline flex items-center gap-1"><HelpCircle size={12} /> Support Center</a>
            </div>
          </div>
        </footer>
      )}

      {/* Overlay Drawer & Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpenLoginModal={() => setLoginOpen(true)}
        onOrderPlaced={handleOrderPlaced}
      />

      <AddressModal
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
        }}
      />

      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={(page) => {
          setMobileMenuOpen(false);
          setActivePage(page);
          if (page === 'home') {
            setActiveCategory(null);
            setSearchQuery('');
            setActiveSubHeaderTab('all');
          }
        }}
        onOpenCart={() => {
          setMobileMenuOpen(false);
          setCartOpen(true);
        }}
        onOpenAddressModal={() => {
          setMobileMenuOpen(false);
          setAddressOpen(true);
        }}
        onOpenLoginModal={() => {
          setMobileMenuOpen(false);
          setLoginOpen(true);
        }}
      />

      <ProductDetailModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
