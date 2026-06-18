import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Home, Shield, ShoppingCart, MapPin, User, LogOut, Info, PhoneCall } from 'lucide-react';

export default function MobileMenuDrawer({ isOpen, onClose, onNavigate, onOpenCart, onOpenAddressModal, onOpenLoginModal }) {
  const { user, logout, deliveryAddress } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-start animate-fade-in" style={{ height: '100vh', maxHeight: '100vh' }}>
      {/* Dark Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} style={{ height: '100vh', maxHeight: '100vh' }} />
      
      {/* Drawer Panel */}
      <div 
        className="relative w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl z-50 overflow-hidden text-left" 
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
          animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-150 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/amigo_logo.png" alt="Amigocart Logo" className="h-7 w-auto object-contain" />
            <span className="font-black text-purple-900 tracking-tight text-base">amigocart</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* User profile block */}
        <div className="bg-purple-50/50 p-4 border-b border-purple-100/40 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center font-bold text-white text-base">
            {user ? user.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-800">{user ? user.name : 'Welcome, Guest!'}</h4>
            <span className="text-[10px] text-gray-500 font-bold">{user ? `+91 ${user.phone}` : 'Log in to track orders'}</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-1.5">
          {/* Shop Home */}
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-purple-800 transition font-bold text-xs"
          >
            <Home size={18} className="text-gray-400" />
            <span>Shop Store</span>
          </button>

          {/* Admin Panel */}
          <button 
            onClick={() => onNavigate('admin')} 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-purple-800 transition font-bold text-xs"
          >
            <Shield size={18} className="text-gray-400" />
            <span>Store Admin Panel</span>
          </button>

          {/* My Cart */}
          <button 
            onClick={onOpenCart} 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-purple-800 transition font-bold text-xs"
          >
            <ShoppingCart size={18} className="text-gray-400" />
            <span>My Cart</span>
          </button>

          {/* Address Modal */}
          <button 
            onClick={onOpenAddressModal} 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-purple-800 transition font-bold text-xs"
          >
            <MapPin size={18} className="text-gray-400" />
            <div className="flex flex-col text-left">
              <span>Delivery Location</span>
              <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[170px] mt-0.5">{deliveryAddress || 'Not Selected'}</span>
            </div>
          </button>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Authentication */}
          {user ? (
            <button 
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-650 transition font-bold text-xs"
            >
              <LogOut size={18} className="text-gray-400" />
              <span>Logout Account</span>
            </button>
          ) : (
            <button 
              onClick={onOpenLoginModal}
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-800 transition font-bold text-xs"
            >
              <User size={18} className="text-gray-400" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-gray-150 p-4 bg-gray-50 text-[10px] text-gray-400 font-bold flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5"><Info size={12} /> Version 1.0.0 (Release)</div>
          <div className="flex items-center gap-1.5"><PhoneCall size={12} /> Designed by amigowebster</div>
        </div>
      </div>
    </div>
  );
}
