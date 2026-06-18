import React, { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { useCart as useCartContext } from '../context/CartContext';

export default function Header({ onOpenCart, onNavigate, onSearch, currentSearch, onOpenAddressModal, onOpenLoginModal }) {
  const { itemCount, cartSubtotal, deliveryAddress, user, logout } = useCartContext();
  const [searchValue, setSearchValue] = useState(currentSearch || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch(val); // Real-time search filter
  };

  return (
    <header className="main-header bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container py-2 flex items-center justify-between gap-4">
        
        {/* Left Side: Logo & Address */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Zepto Logo */}
          <div 
            onClick={() => { setSearchValue(''); onNavigate('home'); }} 
            className="cursor-pointer flex items-center"
            title="Zepto Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="95" height="30" viewBox="0 0 180 59" fill="none">
              <path fill="#7a14ac" d="M93.946 8.93c10.055 0 17.667 8.168 17.667 18.51 0 10.343-7.612 18.512-17.667 18.512a17.39 17.39 0 0 1-11.587-4.327v13.69a3.882 3.882 0 0 1-3.84 3.333 3.878 3.878 0 0 1-3.84-3.334V12.84a3.882 3.882 0 0 1 3.84-3.333 3.877 3.877 0 0 1 3.84 3.333v.485A17.07 17.07 0 0 1 93.946 8.93ZM123.785 0a3.89 3.89 0 0 1 3.728 2.782c.157.533.197 1.093.119 1.643V9.66h8.18a3.545 3.545 0 0 1 2.536 1.03 3.521 3.521 0 0 1 1.039 2.528 3.572 3.572 0 0 1-1.054 2.513 3.59 3.59 0 0 1-2.521 1.045h-8.18v12.604c0 6.147 3.429 9.288 8.18 9.288.955 0 1.872.38 2.548 1.054a3.594 3.594 0 0 1-2.548 6.14c-9.025 0-15.874-6.35-15.874-16.482V16.777h-2.516a3.59 3.59 0 0 1-2.522-1.045 3.575 3.575 0 0 1-.789-3.881 3.54 3.54 0 0 1 3.311-2.19h2.516V4.425a3.868 3.868 0 0 1 .912-3.088A3.874 3.874 0 0 1 123.785 0ZM45.453 10.653a18.513 18.513 0 0 1 19.68 2.587 4.043 4.043 0 0 1 1.39 2.902 4.002 4.002 0 0 1-1.119 2.796l-10.69 12.758a3.226 3.226 0 0 1-2.644 1.257 3.419 3.419 0 0 1-3.345-2.108 3.444 3.444 0 0 1-.263-1.373 3.144 3.144 0 0 1 .829-2.303l8.414-9.886a8.504 8.504 0 0 0-4.583-1.258c-5.972 0-10.7 5.021-10.7 11.357 0 6.336 4.66 11.356 10.7 11.356a9.956 9.956 0 0 0 7.361-3.143c1.11-.9 1.882-1.732 3.338-1.732a3.593 3.593 0 0 1 3.489 2.243c.185.458.276.948.265 1.442a4.06 4.06 0 0 1-1.119 2.506 17.275 17.275 0 0 1-6.028 4.377 17.233 17.233 0 0 1-7.306 1.426A18.1 18.1 0 0 1 40.01 40.53a18.228 18.228 0 0 1-5.307-13.148 18.637 18.637 0 0 1 2.956-9.927 18.569 18.569 0 0 1 7.794-6.802Zm109.015-.319a18.466 18.466 0 1 1 7.066 35.525 18.147 18.147 0 0 1-18.465-18.465 18.467 18.467 0 0 1 11.399-17.06Zm-126.98-.796a3.512 3.512 0 0 1 2.529 1.033 3.536 3.536 0 0 1 1.03 2.536 3.721 3.721 0 0 1-1.114 2.52L11.145 38.114h16.343a3.513 3.513 0 0 1 2.529 1.034 3.538 3.538 0 0 1 1.03 2.537A3.595 3.595 0 0 1 30 44.203a3.574 3.574 0 0 1-2.512 1.05H3.56a3.593 3.593 0 0 1-2.53-1.08A3.614 3.614 0 0 1 0 41.616a3.82 3.82 0 0 1 1.048-2.53l18.759-22.41H4.374a3.574 3.574 0 0 1-2.51-1.05 3.595 3.595 0 0 1-1.05-2.519A3.54 3.54 0 0 1 3.006 9.8c.434-.178.9-.266 1.368-.26h23.114Zm65.624 6.513c-6.002 0-10.54 4.686-10.753 10.895v.494c0 6.5 4.751 11.391 10.753 11.391s10.753-4.89 10.753-11.39c0-6.5-4.75-11.39-10.753-11.39Zm68.422-.019c-6.126 0-10.732 5.091-10.732 11.363 0 6.27 4.597 11.36 10.732 11.36 6.136 0 10.733-5.157 10.734-11.36 0-6.272-4.608-11.363-10.734-11.363Z" />
            </svg>
          </div>

          {/* Location Picker */}
          <div 
            onClick={onOpenAddressModal} 
            className="flex items-center gap-1 cursor-pointer transition duration-150"
          >
            <span className="text-xs font-bold text-gray-800 truncate tracking-tight max-w-[130px] md:max-w-[160px] hover:text-purple-800">
              {deliveryAddress || 'Select Location'}
            </span>
            <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-grow max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder='Search for "banana"'
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-normal text-gray-800 placeholder-gray-450 outline-none focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition duration-200"
            />
            <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </form>
        </div>

        {/* Right Side: Vertical Icons */}
        <div className="flex items-center gap-6 flex-shrink-0">
          
          {/* Admin panel link */}
          <button 
            onClick={() => onNavigate('admin')}
            className="hidden md:block text-[11px] font-bold text-purple-700 hover:text-purple-900 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition"
          >
            Store Admin
          </button>

          {/* User Section (Vertical) */}
          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={logout} 
                className="flex flex-col items-center justify-center text-gray-700 hover:text-red-600 transition duration-150 cursor-pointer"
                title="Logout"
              >
                <LogOut size={20} className="text-gray-500" />
                <span className="text-[10px] font-bold mt-1">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenLoginModal}
              className="flex flex-col items-center justify-center text-gray-750 hover:text-purple-800 transition duration-150 cursor-pointer"
            >
              <User size={20} className="text-gray-600" />
              <span className="text-[10px] font-extrabold mt-1">Login</span>
            </button>
          )}

          {/* Cart Section (Vertical) */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center text-gray-750 hover:text-purple-800 relative transition duration-150 cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart size={20} className="text-gray-600" />
              {itemCount > 0 && (
                <span className="header-cart-badge">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold mt-1">
              {itemCount > 0 ? `₹${cartSubtotal.toFixed(0)}` : 'Cart'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
