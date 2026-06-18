import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, CreditCard, Landmark, Truck, ShieldCheck, QrCode } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, driverTip, onOrderPlaced }) {
  const { cartItems, cartSubtotal, deliveryFee, handlingFee, cartTotal, user, saveAddress } = useCart();
  
  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const finalTotal = cartTotal + driverTip;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setErrorMsg('Please fill out all address details.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    // Prepare items for DB
    const items = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.discount_price !== null ? Number(item.discount_price) : Number(item.price)
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deliveryAddress: address,
          items,
          totalAmount: finalTotal,
          deliveryFee,
          handlingFee
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Save address to context
      saveAddress(address);
      
      // Notify parent of success
      onOrderPlaced(data.orderId);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center animate-fade-in p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-gray-150 p-5 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Complete Your Order</h3>
            <p className="text-xs text-gray-500 mt-0.5">Delivery in 10 minutes to your door</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 flex flex-col gap-5 text-left">
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Customer Details */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">1. Delivery Address</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Recipient Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="e.g. John Doe"
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  placeholder="e.g. 9876543210"
                  className="input-field py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Full Address (Flat/House No, Building, Street)</label>
              <textarea 
                rows={2}
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required
                placeholder="e.g. Flat 304, Marvel Apts, Indiranagar, Bangalore - 560038"
                className="input-field resize-none py-2 text-xs"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">2. Payment Method</h4>
            
            <div className="radio-tile-group">
              <div 
                onClick={() => setPaymentMode('UPI')} 
                className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'UPI' ? 'active' : ''}`}
              >
                <QrCode size={20} />
                <span className="text-xs font-bold">UPI / QR Code</span>
              </div>
              <div 
                onClick={() => setPaymentMode('CARD')} 
                className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'CARD' ? 'active' : ''}`}
              >
                <CreditCard size={20} />
                <span className="text-xs font-bold">Credit / Debit Card</span>
              </div>
              <div 
                onClick={() => setPaymentMode('COD')} 
                className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'COD' ? 'active' : ''}`}
              >
                <Truck size={20} />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </div>
            </div>

            {/* Sub forms depending on payment selection */}
            {paymentMode === 'UPI' && (
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-center gap-4 animate-fade-in">
                <div className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-xs flex-shrink-0">
                  {/* Mock QR Code */}
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center font-bold text-xs text-purple-950 relative border-2 border-purple-900 rounded">
                    [QR]
                    <div className="absolute inset-0.5 border border-dashed border-gray-400"></div>
                  </div>
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-extrabold text-purple-950">Mock UPI Payment</h5>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Scan or authorize via the UPI app. The payment will automatically register as successful when you place order.
                  </p>
                </div>
              </div>
            )}

            {paymentMode === 'CARD' && (
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl flex flex-col gap-3 animate-fade-in">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-field py-1.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">CVV</label>
                    <input 
                      type="password" 
                      placeholder="***" 
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMode === 'COD' && (
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <Truck size={20} className="text-amber-700 flex-shrink-0" />
                <p className="text-[10px] text-amber-900 font-medium">
                  Please keep exact cash ready. Our delivery partner will collect ₹{finalTotal.toFixed(0)} upon arrival at your doorstep.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer with Checkout CTA */}
        <div className="border-t border-gray-150 p-5 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold">
            <ShieldCheck size={16} /> <span>100% Safe Payments</span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-purple-800 hover:bg-purple-900 text-white font-extrabold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition duration-150 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Place Order • ₹{finalTotal.toFixed(0)}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
