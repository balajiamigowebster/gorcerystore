import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, Truck, 
  Heart, ChevronRight, ArrowLeft, QrCode, CreditCard, ShieldCheck 
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, onOpenLoginModal, onOrderPlaced }) {
  const { 
    cartItems, 
    cartSubtotal, 
    deliveryFee, 
    handlingFee, 
    cartTotal, 
    addToCart, 
    removeFromCart, 
    clearCart,
    user,
    saveAddress
  } = useCart();

  const [drawerPage, setDrawerPage] = useState('cart'); // 'cart', 'checkout'
  const [driverTip, setDriverTip] = useState(0);

  // Checkout Form States
  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card details states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Reset drawer state when it closes or opens
  useEffect(() => {
    if (!isOpen) {
      setDrawerPage('cart');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Sync user info if they log in/out while drawer is open
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    } else {
      setName('');
      setPhone('');
    }
  }, [user]);

  if (!isOpen) return null;

  const finalTotal = cartTotal + driverTip;

  const handleSubmitCheckout = async (e) => {
    if (e) e.preventDefault();
    if (!name || !phone || !address) {
      setErrorMsg('Please fill out all address details.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

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

      saveAddress(address);
      clearCart();
      onClose(); // Close the drawer
      onOrderPlaced(data.orderId); // Transition to tracker page
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex justify-end animate-fade-in" style={{ height: '100vh', maxHeight: '100vh' }}>
      {/* Dark Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} style={{ height: '100vh', maxHeight: '100vh' }} />
      
      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-md bg-gray-50 flex flex-col shadow-2xl z-50 overflow-hidden" 
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        
        {/* Drawer Header */}
        <div className="bg-white border-b border-gray-150 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {drawerPage === 'checkout' && (
              <button 
                onClick={() => { setDrawerPage('cart'); setErrorMsg(''); }}
                className="text-gray-500 hover:text-gray-850 mr-1.5 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="font-extrabold text-lg text-gray-800">
              {drawerPage === 'checkout' ? 'Checkout Details' : 'My Cart'}
            </span>
            {drawerPage === 'cart' && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {cartItems.length} Items
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {drawerPage === 'cart' && cartItems.length > 0 && (
              <button 
                onClick={clearCart} 
                className="text-gray-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 p-1 rounded hover:bg-gray-100 transition duration-150"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition duration-150"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        {cartItems.length === 0 ? (
          /* Empty Cart state */
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="bg-purple-50 p-6 rounded-full text-purple-400 mb-4 animate-bounce">
              <ShoppingBag size={54} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 max-w-[250px] mb-6">
              Add products from categories to unlock super-fast 10 minutes delivery.
            </p>
            <button 
              onClick={onClose} 
              className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-2.5 rounded-xl transition duration-150 shadow-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : drawerPage === 'cart' ? (
          /* Cart items view */
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4" style={{ minHeight: 0 }}>
            
            {/* Delivery banner indicator */}
            {cartSubtotal < 199 ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3 text-left">
                <Truck size={20} className="text-blue-600 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-blue-900">Add ₹{(199 - cartSubtotal).toFixed(0)} more</span> to unlock <span className="font-bold">FREE Delivery</span> (Current fee: ₹29).
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3 text-left">
                <Truck size={20} className="text-green-600 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-green-900">Congratulations!</span> You have unlocked <span className="font-extrabold text-green-700">FREE Delivery</span> for this order!
                </div>
              </div>
            )}

            {/* List of Cart Items */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              {cartItems.map((item) => {
                const itemPrice = item.discount_price !== null ? Number(item.discount_price) : Number(item.price);
                return (
                  <div key={item.id} className="p-4 flex gap-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition duration-150">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-white"
                    />
                    <div className="flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                        <span className="text-[10px] text-gray-400">{item.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-extrabold text-gray-900">₹{itemPrice.toFixed(0)}</span>
                        {item.discount_price !== null && (
                          <span className="text-[10px] text-gray-400 line-through">₹{Number(item.price).toFixed(0)}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col justify-between items-end">
                      <div className="flex items-center bg-pink-600 text-white rounded-xl overflow-hidden shadow-xs">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="px-2 py-1.5 hover:bg-pink-700 transition duration-150"
                        >
                          <Minus size={10} className="stroke-[3]" />
                        </button>
                        <span className="text-xs font-extrabold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="px-2 py-1.5 hover:bg-pink-700 transition duration-150"
                        >
                          <Plus size={10} className="stroke-[3]" />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-gray-800 mt-2">
                        ₹{(itemPrice * item.quantity).toFixed(0)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Delivery Partner Tip Widget */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-left">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
                <Heart size={14} className="text-pink-600 fill-pink-600" /> Support Delivery Partner
              </h4>
              <p className="text-[10px] text-gray-500 mb-3">
                100% of this tip goes to your delivery partner to support their effort in 10-mins deliveries.
              </p>
              <div className="flex gap-2">
                {[10, 20, 35, 50].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setDriverTip(driverTip === tip ? 0 : tip)}
                    className={`flex-1 py-2 border text-xs font-black rounded-full transition duration-150 ${
                      driverTip === tip 
                        ? 'border-pink-600 bg-pink-50 text-pink-600' 
                        : 'border-gray-200 bg-white text-gray-655 hover:bg-gray-50'
                    }`}
                  >
                    +₹{tip}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing details */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-left flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-gray-800 mb-0.5">Bill Details</h4>
              
              <div className="flex justify-between text-xs text-gray-655 font-semibold">
                <span>Items Total</span>
                <span className="font-bold text-gray-800">₹{cartSubtotal.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-655 font-semibold">
                <span className="flex items-center gap-1">Handling Charge <span className="bg-purple-100 text-purple-850 text-[8px] font-extrabold px-1.5 py-0.5 rounded">SAFE</span></span>
                <span className="font-bold text-gray-800">₹{handlingFee.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-655 font-semibold">
                <span>Delivery Partner Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-extrabold text-green-700">FREE</span>
                ) : (
                  <span className="font-bold text-gray-800">₹{deliveryFee.toFixed(0)}</span>
                )}
              </div>

              {driverTip > 0 && (
                <div className="flex justify-between text-xs text-gray-655 font-semibold">
                  <span>Delivery Partner Tip</span>
                  <span className="font-bold text-pink-600">₹{driverTip}</span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-150 my-1"></div>

              <div className="flex justify-between text-sm font-black text-gray-900">
                <span>To Pay</span>
                <span className="text-pink-600">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

          </div>
        ) : (
          /* Checkout view page */
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 text-left bg-gray-50" style={{ minHeight: 0 }}>
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-755 text-xs font-bold p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Recipient / Address form */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">1. Delivery Details</h4>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Recipient Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="e.g. John Doe"
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  placeholder="e.g. 9876543210"
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Address</label>
                <textarea 
                  rows={2}
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required
                  placeholder="Flat/House No, Building, Street, Area"
                  className="input-field resize-none py-2 text-xs"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">2. Payment Method</h4>
              
              <div className="radio-tile-group">
                <div 
                  onClick={() => setPaymentMode('UPI')} 
                  className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'UPI' ? 'active' : ''}`}
                >
                  <QrCode size={18} />
                  <span className="text-[10px] font-bold">UPI / QR</span>
                </div>
                <div 
                  onClick={() => setPaymentMode('CARD')} 
                  className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'CARD' ? 'active' : ''}`}
                >
                  <CreditCard size={18} />
                  <span className="text-[10px] font-bold">Card</span>
                </div>
                <div 
                  onClick={() => setPaymentMode('COD')} 
                  className={`radio-tile flex items-center justify-center flex-col gap-1.5 ${paymentMode === 'COD' ? 'active' : ''}`}
                >
                  <Truck size={18} />
                  <span className="text-[10px] font-bold">COD / Cash</span>
                </div>
              </div>

              {/* Payment subform elements */}
              {paymentMode === 'UPI' && (
                <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl flex items-center gap-3 animate-fade-in">
                  <div className="bg-white p-1.5 rounded-lg border border-purple-200 shadow-xs flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center font-bold text-[10px] text-purple-950 relative border border-purple-900 rounded">
                      [QR]
                      <div className="absolute inset-0.5 border border-dashed border-gray-400"></div>
                    </div>
                  </div>
                  <div className="text-left">
                    <h5 className="text-[11px] font-extrabold text-purple-950">Scan QR Code</h5>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">
                      UPI scan matches automatically upon order placement.
                    </p>
                  </div>
                </div>
              )}

              {paymentMode === 'CARD' && (
                <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl flex flex-col gap-2.5 animate-fade-in">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 block">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field py-1 text-xs bg-white border-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 block">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="input-field py-1 text-xs bg-white border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 block">CVV</label>
                      <input 
                        type="password" 
                        placeholder="***" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="input-field py-1 text-xs bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMode === 'COD' && (
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <Truck size={16} className="text-amber-700 flex-shrink-0" />
                  <p className="text-[9px] text-amber-900 font-semibold leading-tight">
                    Please keep cash ready. Pay ₹{finalTotal.toFixed(0)} upon delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Bill recap */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-left flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-gray-800 mb-0.5">Order Recap</h4>
              
              <div className="flex justify-between text-xs text-gray-655 font-semibold">
                <span>Items Subtotal</span>
                <span className="text-gray-800">₹{cartSubtotal.toFixed(0)}</span>
              </div>
              {driverTip > 0 && (
                <div className="flex justify-between text-xs text-gray-655 font-semibold">
                  <span>Driver Tip</span>
                  <span className="text-gray-800">₹{driverTip}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-655 font-semibold">
                <span>Fees & Delivery</span>
                <span className="text-gray-800">₹{(deliveryFee + handlingFee).toFixed(0)}</span>
              </div>
              <div className="border-t border-dashed border-gray-150 my-0.5"></div>
              <div className="flex justify-between text-sm font-black text-gray-950">
                <span>Grand Total To Pay</span>
                <span className="text-pink-600">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-green-700 font-bold py-1">
              <ShieldCheck size={14} /> <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-gray-150 p-4">
            {drawerPage === 'cart' ? (
              <button
                onClick={() => {
                  if (!user && onOpenLoginModal) {
                    onOpenLoginModal();
                  } else {
                    setDrawerPage('checkout');
                  }
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold p-3.5 rounded-2xl shadow-md transition duration-200 flex items-center justify-between group"
              >
                <div className="flex flex-col items-start text-left leading-normal">
                  <span className="text-[11px] text-white/80 font-bold">Total: ₹{finalTotal.toFixed(0)}</span>
                  <span className="text-[13px] text-yellow-300 font-black tracking-wider uppercase mt-0.5">Proceed to Checkout</span>
                </div>
                <div className="flex items-center gap-0.5 font-bold text-sm bg-white/10 px-3 py-1.5 rounded-xl group-hover:bg-white/20 transition duration-150">
                  <span>Next</span>
                  <ChevronRight size={14} className="stroke-[3]" />
                </div>
              </button>
            ) : (
              <button
                onClick={handleSubmitCheckout}
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-extrabold p-3.5 rounded-2xl shadow-md transition duration-200 flex items-center justify-between group"
              >
                <div className="flex flex-col items-start text-left leading-normal">
                  <span className="text-[11px] text-white/80 font-bold">Total: ₹{finalTotal.toFixed(0)}</span>
                  <span className="text-[13px] text-yellow-300 font-black tracking-wider uppercase mt-0.5">Place Order</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-sm bg-white/10 px-3 py-1.5 rounded-xl group-hover:bg-white/20 transition duration-150">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ChevronRight size={14} className="stroke-[3]" />
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
