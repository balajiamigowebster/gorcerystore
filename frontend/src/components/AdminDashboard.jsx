import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, ShoppingBag, PackageOpen, AlertTriangle, 
  RefreshCw, BarChart2, PlusCircle, FileText, ClipboardList, Printer, X,
  Lock, LogOut, Edit3, Search, CheckCircle
} from 'lucide-react';

export default function AdminDashboard({ onBackToHome }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'add-product', 'orders'
  
  // Data States
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProductsList, setLoadingProductsList] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    image_url: '',
    unit: '',
    stock: 100,
    is_fresh: false,
    is_bestseller: false,
    special_tag: ''
  });
  const [productSuccess, setProductSuccess] = useState('');
  const [productError, setProductError] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null); // The product currently being edited
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Search & Filter state for Inventory list
  const [inventorySearch, setInventorySearch] = useState('');

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailItems, setOrderDetailItems] = useState([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && (password === 'admin123' || password === 'adminpassword')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
  };

  // 1. Fetch Stats & Categories (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchStatsAndCategories() {
      setLoading(true);
      try {
        const statsRes = await fetch('/api/admin/stats');
        if (!statsRes.ok) throw new Error('Failed to fetch statistics');
        const statsData = await statsRes.json();
        setStats(statsData);

        const catsRes = await fetch('/api/categories');
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
          if (catsData.length > 0 && !newProduct.category_id) {
            setNewProduct(prev => ({ ...prev, category_id: catsData[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch admin stats.');
      } finally {
        setLoading(false);
      }
    }
    fetchStatsAndCategories();
  }, [refreshTrigger, isAuthenticated]);

  // 2. Fetch Orders (runs when Orders tab is active or statistics refresh)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'orders' || refreshTrigger > 0) {
      async function fetchOrders() {
        setLoadingOrders(true);
        try {
          const response = await fetch('/api/admin/orders');
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      }
      fetchOrders();
    }
  }, [activeTab, refreshTrigger, isAuthenticated]);

  // 3. Fetch All Products (for Inventory Tab)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'inventory' || refreshTrigger > 0) {
      async function fetchAllProducts() {
        setLoadingProductsList(true);
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            setAllProducts(data);
          }
        } catch (err) {
          console.error('Error fetching inventory products:', err);
        } finally {
          setLoadingProductsList(false);
        }
      }
      fetchAllProducts();
    }
  }, [activeTab, refreshTrigger, isAuthenticated]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 4. Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setProductSuccess('');
    setProductError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add product');

      setProductSuccess('Product added successfully to inventory!');
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        category_id: categories[0]?.id || '',
        image_url: '',
        unit: '',
        stock: 100,
        is_fresh: false,
        is_bestseller: false,
        special_tag: ''
      });
      handleRefresh(); // Refresh catalog counts
    } catch (err) {
      setProductError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // 5. Update Product SKU Details (Edit Form Handler)
  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          discount_price: editingProduct.discount_price,
          category_id: editingProduct.category_id,
          image_url: editingProduct.image_url,
          unit: editingProduct.unit,
          stock: editingProduct.stock,
          is_fresh: editingProduct.is_fresh,
          is_bestseller: editingProduct.is_bestseller,
          special_tag: editingProduct.special_tag
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update product');

      setEditSuccessMsg('Product SKU updated successfully!');
      handleRefresh(); // Refresh product data and dashboard statistics
      
      // Close modal after a short delay
      setTimeout(() => {
        setEditingProduct(null);
        setEditSuccessMsg('');
      }, 700);
    } catch (err) {
      setEditErrorMsg(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // 6. Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        handleRefresh(); // Update total sales stats
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  // 7. Open Invoice Viewer
  const handleOpenInvoice = async (order) => {
    setSelectedOrder(order);
    setLoadingInvoice(true);
    setOrderDetailItems([]);

    try {
      const response = await fetch(`/api/orders/${order.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetailItems(data.items);
      } else {
        alert('Failed to load invoice items');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Helper: Status badge color picker
  const getStatusClass = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'Out for Delivery': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Preparing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Confirmed': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // ==========================================
  // RENDER LOGIN GATE IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-2xl max-w-sm w-full text-left">
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-purple-50 text-purple-800 p-4 rounded-full w-fit mb-3">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-purple-950">Store Admin Login</h3>
            <p className="text-xs text-gray-500 mt-1">Authorized access to inventory & order ledgers only</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-755 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Admin Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="input-field py-2 text-xs font-semibold bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Admin Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field py-2 text-xs font-semibold bg-white border border-gray-200"
              />
            </div>

            <button
              type="submit"
              className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-2.5 rounded-xl transition mt-2 shadow-xs text-xs"
            >
              Verify Credentials
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-4 flex flex-col gap-1 text-center text-[10px] text-gray-400 font-bold bg-gray-50 p-3 rounded-xl">
            <span>Mock Login Access Credentials:</span>
            <span className="text-purple-800 uppercase font-black">Username: admin | Password: admin123</span>
          </div>

          <button 
            onClick={onBackToHome}
            className="w-full text-center mt-4 text-xs font-bold text-gray-500 hover:text-purple-700 transition"
          >
            Back to Shopping Home
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER LOADING / SKELETON
  // ==========================================
  if (loading && !stats) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-750 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-semibold">Generating Store Analytics...</p>
      </div>
    );
  }

  // Filter products for Inventory Tab search
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  return (
    <div className="container py-6 max-w-6xl text-left">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-purple-950 flex items-center gap-2">
            <BarChart2 size={24} className="text-purple-700" /> Amigocart Store Admin Panel
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time MariaDB inventory control & transaction logs</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Ledger
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-red-755 bg-white border border-red-100 hover:bg-red-50 px-3.5 py-2 rounded-xl transition"
            title="Log out of Admin session"
          >
            <LogOut size={14} /> Logout
          </button>
          <button 
            onClick={onBackToHome}
            className="flex-1 sm:flex-none text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-xl shadow-xs transition"
          >
            Back to Shop
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'overview' 
              ? 'border-purple-700 text-purple-700' 
              : 'border-transparent text-gray-550 hover:text-gray-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'inventory' 
              ? 'border-purple-700 text-purple-700' 
              : 'border-transparent text-gray-550 hover:text-gray-800'
          }`}
        >
          Manage Products & Price
        </button>
        <button
          onClick={() => setActiveTab('add-product')}
          className={`px-4 py-2 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'add-product' 
              ? 'border-purple-700 text-purple-700' 
              : 'border-transparent text-gray-550 hover:text-gray-800'
          }`}
        >
          Add Product SKU
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'orders' 
              ? 'border-purple-700 text-purple-700' 
              : 'border-transparent text-gray-550 hover:text-gray-800'
          }`}
        >
          Manage Orders
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-750 p-4 rounded-2xl text-xs font-semibold mb-6">
          {error}
        </div>
      )}

      {/* TABS CONTENT */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <IndianRupee size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Gross Revenue</span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">₹{stats.summary.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-pink-100 text-pink-700 rounded-xl">
                <ShoppingBag size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Total Orders</span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.summary.totalOrders} Completed</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <PackageOpen size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Catalog Inventory</span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.summary.totalProducts} SKU items</h3>
              </div>
            </div>
          </div>

          {/* Low Stock & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider mb-4">Top-Selling SKUs</h3>
              {stats.topProducts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No sales recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {stats.topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-gray-400 w-4">{idx + 1}.</span>
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain rounded border border-gray-100 bg-white" />
                        <span className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-gray-800 block">{p.unitsSold} sold</span>
                        <span className="text-[10px] text-gray-400">Revenue: ₹{Number(p.revenue).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500 fill-amber-500" /> Inventory Reorder Alerts
              </h3>
              {stats.lowStock.length === 0 ? (
                <p className="text-xs text-green-600 font-bold text-center py-6">All products are healthy in stock!</p>
              ) : (
                <div className="flex flex-col gap-3.5 max-h-56 overflow-y-auto pr-1">
                  {stats.lowStock.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 object-contain rounded border border-gray-100 bg-white" />
                        <span className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-gray-400">({p.unit})</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          p.stock < 5 ? 'bg-red-100 text-red-755' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sales Ledger */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs overflow-hidden">
            <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider mb-4">Recent Sales Ledger</h3>
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No transactions loaded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="py-2.5 font-bold">Order ID</th>
                      <th className="py-2.5 font-bold">Customer</th>
                      <th className="py-2.5 font-bold">Date</th>
                      <th className="py-2.5 font-bold">Amount</th>
                      <th className="py-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((ord) => (
                      <tr key={ord.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                        <td className="py-3 font-extrabold text-purple-800">#ZP-00{ord.id}</td>
                        <td className="py-3 font-semibold text-gray-850">{ord.customer_name}</td>
                        <td className="py-3 text-gray-500">{new Date(ord.created_at).toLocaleString()}</td>
                        <td className="py-3 font-black text-gray-900">₹{Number(ord.total_amount).toFixed(0)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${getStatusClass(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MANAGE PRODUCTS INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col gap-4">
          
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider">Catalog Inventory & Price List</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Edit pricing, stock metrics, and product classifications</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search catalog SKU..."
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
                className="input-field py-1.5 pl-9 pr-3 text-xs bg-gray-50 border-gray-200"
              />
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {loadingProductsList ? (
            <div className="py-12 text-center text-gray-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin text-purple-800" />
              <span>Fetching Inventory SKU Catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="py-12 text-center text-gray-400 text-xs font-bold">No products found matching the search criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="py-2.5 font-bold">ID</th>
                    <th className="py-2.5 font-bold">Thumbnail</th>
                    <th className="py-2.5 font-bold">Product Title</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold">Original Price</th>
                    <th className="py-2.5 font-bold">Discount Price</th>
                    <th className="py-2.5 font-bold">Stock</th>
                    <th className="py-2.5 font-bold">Unit</th>
                    <th className="py-2.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                      <td className="py-3 font-extrabold text-purple-800">#SKU-{p.id}</td>
                      <td className="py-3">
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 object-contain rounded border border-gray-100 bg-white" />
                      </td>
                      <td className="py-3 font-semibold text-gray-800 max-w-xs truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="py-3 text-gray-500 font-medium">{p.category_name || 'Sub-Category'}</td>
                      <td className="py-3 font-black text-gray-800">₹{Number(p.price).toFixed(2)}</td>
                      <td className="py-3 font-black text-green-700">
                        {p.discount_price !== null ? `₹${Number(p.discount_price).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock < 15 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-655'
                        }`}>
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 font-bold">{p.unit}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setEditingProduct({ ...p })}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 size={11} /> Edit SKU
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ADD PRODUCT TAB */}
      {activeTab === 'add-product' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-w-3xl">
          <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2 mb-4">
            <PlusCircle size={20} className="text-purple-700" /> Insert New Product SKU
          </h3>

          {productSuccess && (
            <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-xs font-semibold mb-4">
              {productSuccess}
            </div>
          )}

          {productError && (
            <div className="bg-red-50 border border-red-100 text-red-755 p-4 rounded-xl text-xs font-semibold mb-4">
              {productError}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Product Name *</label>
              <input 
                type="text" 
                required
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="e.g. Red Grapes Sweet"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Category *</label>
              <select
                value={newProduct.category_id}
                onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                className="input-field bg-white border border-gray-200"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
              <textarea 
                rows="2"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Product description and details..."
                className="input-field bg-white border border-gray-200 p-2 h-auto"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Original Price (₹) *</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="e.g. 120"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Discount Price (₹, optional)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={newProduct.discount_price}
                onChange={e => setNewProduct({...newProduct, discount_price: e.target.value})}
                placeholder="e.g. 99"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Unit / Package Size *</label>
              <input 
                type="text" 
                required
                value={newProduct.unit}
                onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                placeholder="e.g. 500 g, 6 pcs, 1 L"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Stock Count *</label>
              <input 
                type="number" 
                required
                min="0"
                value={newProduct.stock}
                onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                placeholder="100"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Image URL</label>
              <input 
                type="text" 
                value={newProduct.image_url}
                onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                placeholder="https://unsplash.com/..."
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Special Tag (e.g. Bestseller, 20% OFF)</label>
              <input 
                type="text" 
                value={newProduct.special_tag}
                onChange={e => setNewProduct({...newProduct, special_tag: e.target.value})}
                placeholder="e.g. Farm Fresh"
                className="input-field bg-white border border-gray-200"
              />
            </div>

            <div className="flex items-center gap-6 mt-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newProduct.is_fresh}
                  onChange={e => setNewProduct({...newProduct, is_fresh: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Is Fresh Product (Fruits & Vegetables)
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newProduct.is_bestseller}
                  onChange={e => setNewProduct({...newProduct, is_bestseller: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Mark as Bestseller
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingProduct}
              className="mt-4 sm:col-span-2 bg-purple-800 hover:bg-purple-900 disabled:bg-purple-400 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 text-xs cursor-pointer"
            >
              {submittingProduct ? 'Adding SKU...' : 'Add Product to Inventory'}
            </button>
          </form>
        </div>
      )}

      {/* 4. MANAGE ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
          <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2 mb-4">
            <ClipboardList size={20} className="text-purple-700" /> Customer Sales Orders Management
          </h3>

          {loadingOrders ? (
            <div className="py-12 text-center text-gray-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin text-purple-800" />
              <span>Fetching Order Transactions...</span>
            </div>
          ) : orders.length === 0 ? (
            <p className="py-12 text-center text-gray-400 text-xs font-bold">No orders recorded in database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="py-3 font-bold">Order ID</th>
                    <th className="py-3 font-bold">Customer Details</th>
                    <th className="py-3 font-bold">Delivery Address</th>
                    <th className="py-3 font-bold">Order Date</th>
                    <th className="py-3 font-bold">Total Amount</th>
                    <th className="py-3 font-bold">Status Action</th>
                    <th className="py-3 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                      <td className="py-4 font-extrabold text-purple-855 text-sm">#ZP-00{ord.id}</td>
                      <td className="py-4">
                        <span className="font-extrabold text-gray-800 block text-xs">{ord.customer_name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{ord.customer_phone}</span>
                      </td>
                      <td className="py-4 max-w-xs truncate" title={ord.delivery_address}>
                        <span className="text-[11px] text-gray-655 font-medium">{ord.delivery_address}</span>
                      </td>
                      <td className="py-4 text-gray-500 font-medium">
                        {new Date(ord.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 font-black text-gray-900 text-sm">
                        ₹{Number(ord.total_amount).toFixed(0)}
                      </td>
                      <td className="py-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg border font-bold text-[10px] outline-none cursor-pointer ${getStatusClass(ord.status)}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleOpenInvoice(ord)}
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 hover:text-purple-900 hover:bg-purple-50 border border-purple-100 bg-white px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          <FileText size={12} /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          EDIT PRODUCT SKU MODAL OVERLAY
          ========================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          {/* Backdrop click close */}
          <div className="fixed inset-0" onClick={() => setEditingProduct(null)} />
          
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 relative border border-gray-150 flex flex-col max-h-[90vh] overflow-hidden z-50 text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                  <Edit3 size={18} className="text-purple-700" /> Edit Product Catalog SKU
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Modify SKU #{editingProduct.id} information & price tags</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleUpdateProductSubmit} className="flex-grow overflow-y-auto pr-1 flex flex-col gap-4">
              {editSuccessMsg && (
                <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle size={16} /> {editSuccessMsg}
                </div>
              )}

              {editErrorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-755 p-3 rounded-xl text-xs font-semibold">
                  {editErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Category *</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
                  <textarea 
                    rows="2"
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="input-field bg-white border border-gray-200 p-2 text-xs h-auto resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Original Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Discount Price (₹, optional)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={editingProduct.discount_price || ''}
                    onChange={e => setEditingProduct({...editingProduct, discount_price: e.target.value !== '' ? e.target.value : null})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Unit Size *</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct.unit}
                    onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Stock Count *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Image URL</label>
                  <input 
                    type="text" 
                    value={editingProduct.image_url || ''}
                    onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Special Tag</label>
                  <input 
                    type="text" 
                    value={editingProduct.special_tag || ''}
                    onChange={e => setEditingProduct({...editingProduct, special_tag: e.target.value})}
                    className="input-field bg-white border border-gray-200 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center gap-6 mt-2 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!editingProduct.is_fresh}
                      onChange={e => setEditingProduct({...editingProduct, is_fresh: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Is Fresh Product
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!editingProduct.is_bestseller}
                      onChange={e => setEditingProduct({...editingProduct, is_bestseller: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Mark as Bestseller
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="border-t border-gray-100 pt-4 mt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="text-xs font-extrabold text-white bg-purple-750 hover:bg-purple-800 px-5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save SKU Details</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==========================================
          INVOICE BILL MODAL OVERLAY
          ========================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 relative border border-gray-150 flex flex-col max-h-[90vh] overflow-hidden" style={{ pointerEvents: 'auto' }}>
            
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            {/* Modal Scrollable Wrapper */}
            <div className="flex-grow overflow-y-auto pr-1">
              
              {/* Invoice Printable Template wrapper */}
              <div id="print-invoice-area" className="text-left font-sans text-gray-800 p-2">
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-black text-purple-800 tracking-tight">AMIGOCART INVOICE</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Transaction Ledger Receipt</p>
                  </div>
                  <div className="text-right text-xs">
                    <h2 className="font-extrabold text-gray-900">Amigocart Super Store</h2>
                    <p className="text-gray-400 text-[10px] mt-0.5">Bangalore Central Hub, KA</p>
                    <p className="text-gray-400 text-[10px]">support@amigocart.com</p>
                  </div>
                </div>

                {/* Meta details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Billed To:</span>
                    <span className="font-extrabold text-gray-900">{selectedOrder.customer_name}</span>
                    <span className="font-medium text-gray-655">{selectedOrder.customer_phone}</span>
                    <span className="text-gray-500 leading-tight mt-1 max-w-[240px] block">{selectedOrder.delivery_address}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:items-end">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Invoice Metadata:</span>
                    <span className="font-black text-purple-900 text-sm">#ZP-00{selectedOrder.id}</span>
                    <span className="font-bold text-gray-850 mt-1">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-400">Time: {new Date(selectedOrder.created_at).toLocaleTimeString()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border w-fit mt-1.5 ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Purchased Items Details</h4>
                {loadingInvoice ? (
                  <div className="py-8 text-center text-gray-400 text-xs font-bold">
                    <RefreshCw size={16} className="animate-spin inline mr-1.5 text-purple-800" />
                    Loading bill details...
                  </div>
                ) : (
                  <div className="border border-gray-150 rounded-2xl overflow-hidden mb-4 bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                          <th className="p-3 font-bold">Item Description</th>
                          <th className="p-3 font-bold text-center">Unit</th>
                          <th className="p-3 font-bold text-right">Price</th>
                          <th className="p-3 font-bold text-center">Qty</th>
                          <th className="p-3 font-bold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetailItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 font-medium text-gray-700">
                            <td className="p-3 font-bold text-gray-800">{item.name}</td>
                            <td className="p-3 text-center text-gray-400">{item.unit}</td>
                            <td className="p-3 text-right">₹{Number(item.price).toFixed(0)}</td>
                            <td className="p-3 text-center font-bold text-gray-900">{item.quantity}</td>
                            <td className="p-3 text-right font-bold text-gray-800">₹{(Number(item.price) * item.quantity).toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Invoice Footer / Pricing math */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-dashed border-gray-200 pt-4">
                  <div className="text-[10px] text-gray-400 font-semibold max-w-[280px]">
                    <p className="font-bold uppercase text-gray-500 mb-1">Payment Method & Safety</p>
                    <p>This invoice is electronically generated and acts as a safe receipt. Delivery fulfilled by Amigocart central hub.</p>
                  </div>
                  <div className="w-full sm:w-64 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between text-gray-550">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-gray-800">₹{(Number(selectedOrder.total_amount) - Number(selectedOrder.delivery_fee) - Number(selectedOrder.handling_fee)).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-550">
                      <span>Handling Charge (SAFE)</span>
                      <span className="font-bold text-gray-800">₹{Number(selectedOrder.handling_fee).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-550">
                      <span>Delivery Charge</span>
                      <span className="font-bold text-gray-800">
                        {Number(selectedOrder.delivery_fee) === 0 ? 'FREE' : `₹${Number(selectedOrder.delivery_fee).toFixed(0)}`}
                      </span>
                    </div>
                    <div className="border-t border-dashed border-gray-150 my-1"></div>
                    <div className="flex justify-between text-sm font-black text-gray-950">
                      <span>Grand Total Paid</span>
                      <span className="text-purple-900">₹{Number(selectedOrder.total_amount).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-100 pt-4 mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close Receipt
              </button>
              <button
                onClick={() => {
                  const printContents = document.getElementById('print-invoice-area').innerHTML;
                  const iframe = document.createElement('iframe');
                  iframe.style.position = 'fixed';
                  iframe.style.right = '0';
                  iframe.style.bottom = '0';
                  iframe.style.width = '0';
                  iframe.style.height = '0';
                  iframe.style.border = '0';
                  document.body.appendChild(iframe);
                  
                  const doc = iframe.contentWindow.document;
                  
                  let stylesHtml = '';
                  for (const styleSheet of document.styleSheets) {
                    try {
                      if (styleSheet.href) {
                        stylesHtml += `<link rel="stylesheet" href="${styleSheet.href}">`;
                      } else {
                        const rules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
                        stylesHtml += `<style>${rules}</style>`;
                      }
                    } catch (e) {
                      console.warn('Could not read stylesheet rules', e);
                    }
                  }
                  
                  doc.open();
                  doc.write(`
                    <html>
                      <head>
                        <title>Print Invoice</title>
                        ${stylesHtml}
                        <style>
                          body {
                            background-color: white !important;
                            padding: 20px !important;
                          }
                        </style>
                      </head>
                      <body>
                        ${printContents}
                      </body>
                    </html>
                  `);
                  doc.close();
                  
                  iframe.contentWindow.focus();
                  setTimeout(() => {
                    iframe.contentWindow.print();
                    document.body.removeChild(iframe);
                  }, 500);
                }}
                className="text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Printer size={13} /> Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
