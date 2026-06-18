import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, MapPin } from 'lucide-react';

export default function AddressModal({ isOpen, onClose }) {
  const { deliveryAddress, saveAddress } = useCart();
  const [address, setAddress] = useState(deliveryAddress);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (address.trim()) {
      saveAddress(address.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center animate-fade-in p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl z-50 p-6 text-left">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
            <MapPin size={20} className="text-purple-600" /> Enter Delivery Location
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
              Address Detail / Landmark
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Apartment/House No, Building, Area/Street, Bangalore"
              required
              className="input-field text-xs resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-lg shadow-xs transition"
            >
              Confirm Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
