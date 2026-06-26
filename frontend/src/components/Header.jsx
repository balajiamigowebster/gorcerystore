import React, { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useCart as useCartContext } from '../context/CartContext';

export default function Header({ onOpenCart, onNavigate, onSearch, currentSearch, onOpenAddressModal, onOpenLoginModal, onOpenMobileMenu }) {
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
      <div className="container py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 md:gap-4">
        
        {/* Left Side: Logo & Address */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 order-1">
          {/* Hamburger Menu on Mobile */}
          <button 
            onClick={onOpenMobileMenu}
            className="header-hamburger"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>

          {/* Amigobasket Logo */}
          <div 
            onClick={() => { setSearchValue(''); onNavigate('home'); }} 
            className="cursor-pointer flex items-center"
            title="Amigobasket Home"
          >
            <img src="/amigo_logo.png" alt="Amigobasket Logo" className="header-logo" />
          </div>

          {/* Location Picker */}
          <div 
            onClick={onOpenAddressModal} 
            className="flex items-center gap-1 cursor-pointer transition duration-150"
          >
            <span className="text-xs font-bold text-gray-800 tracking-tight header-address hover:text-purple-800">
              {deliveryAddress || 'Select Location'}
            </span>
            <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="w-full md:w-auto md:flex-grow max-w-none md:max-w-xl order-3 md:order-2">
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
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 order-2 md:order-3">
          
          {/* Admin panel link */}
          <button 
            onClick={() => onNavigate('admin')}
            className="hidden md:block text-[11px] font-bold text-purple-700 hover:text-purple-900 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition"
          >
            Store Admin
          </button>

          {/* User Section (Vertical) */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={logout} 
                className="flex flex-col items-center justify-center text-gray-770 hover:text-red-600 transition duration-150 cursor-pointer"
                title="Logout"
              >
                <LogOut size={20} className="text-gray-500" />
                <span className="text-[10px] font-bold mt-1">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenLoginModal}
              className="hidden md:flex flex-col items-center justify-center text-gray-750 hover:text-purple-800 transition duration-150 cursor-pointer"
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
