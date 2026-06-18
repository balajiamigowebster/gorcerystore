import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Truck, Phone, Package, Box, ShoppingBag } from 'lucide-react';

const TRACKING_STEPS = [
  { id: 'Confirmed', label: 'Order Confirmed', desc: 'We have received your order.', time: '0 min' },
  { id: 'Packing', label: 'Packing Groceries', desc: 'Our store execs are picking fresh items.', time: '2 mins' },
  { id: 'Assigned', label: 'Partner Assigned', desc: 'Ravi Kumar is heading to store.', time: '4 mins' },
  { id: 'Shipping', label: 'Out for Delivery', desc: 'Ravi is riding towards your location.', time: '7 mins' },
  { id: 'Delivered', label: 'Delivered', desc: 'Enjoy your fresh groceries!', time: '10 mins' }
];

export default function OrderTracker({ orderId, onBackToHome }) {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time tracking stage index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // 10 mins countdown (in seconds: 600)
  const [timeLeft, setTimeLeft] = useState(600); 

  // Fetch Order details on load
  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrderData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load order tracker');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || currentStepIndex === 4) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentStepIndex]);

  // Automatically advance steps for demonstration purposes (every 20s for demo, normally 2 mins)
  useEffect(() => {
    if (currentStepIndex >= 4) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, 4));
    }, 30000); // 30s per step
    return () => clearInterval(interval);
  }, [currentStepIndex]);

  // Format time remaining MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Skip or speed up for demo purposes
  const handleSpeedUp = () => {
    if (currentStepIndex < 4) {
      setCurrentStepIndex((prev) => prev + 1);
      // Reduce time left accordingly
      setTimeLeft((prev) => Math.max(prev - 120, 0));
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-semibold">Locating your order tracker...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4"><Package size={40} /></div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Error Loading Tracker</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">{error || 'Could not fetch tracking parameters.'}</p>
        <button onClick={onBackToHome} className="bg-purple-800 text-white font-bold px-6 py-2 rounded-xl">Back to Shopping</button>
      </div>
    );
  }

  const { order, items } = orderData;
  const currentStep = TRACKING_STEPS[currentStepIndex];

  return (
    <div className="container py-6 max-w-4xl">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBackToHome}
          className="text-sm font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
        >
          ← Back to Shopping
        </button>
        <div className="flex gap-2">
          {currentStepIndex < 4 && (
            <button
              onClick={handleSpeedUp}
              className="text-xs font-semibold text-pink-700 hover:text-pink-900 bg-pink-50 border border-pink-100 px-3 py-2 rounded-xl hover:bg-pink-100 transition"
            >
              ⏩ Speed Up Delivery (Demo)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Live Status & Timeline */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Main Delivery Promise Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
            
            {/* Glowing accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-600 to-pink-500"></div>

            <div className="text-left z-10">
              <span className="text-xs font-extrabold text-purple-900 tracking-wider uppercase mb-1 block">
                Arriving in
              </span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                {currentStepIndex === 4 ? 'DELIVERED' : formatTime(timeLeft)}
              </h2>
              <p className="text-sm font-bold text-pink-600 flex items-center gap-1.5">
                <Clock size={16} /> <span>Status: {currentStep.label}</span>
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-full text-purple-600 relative z-10 flex-shrink-0 animate-bounce">
              {currentStepIndex < 2 ? <Box size={40} /> : currentStepIndex < 4 ? <Truck size={40} className="scale-x-[-1]" /> : <CheckCircle size={40} className="text-green-600" />}
            </div>

            {/* Background design */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          </div>

          {/* Timeline Tracker */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-left">
            <h3 className="text-sm font-extrabold text-purple-950 uppercase tracking-wider mb-6">Delivery Timeline</h3>
            
            <div className="flex flex-col gap-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div key={step.id} className="relative flex gap-4 items-start">
                    
                    {/* Circle Bullet */}
                    <span 
                      className={`absolute -left-6.5 top-1 w-5.5 h-5.5 rounded-full border-4 flex items-center justify-center transition duration-300 z-10 ${
                        isCompleted 
                          ? 'bg-purple-800 border-purple-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {isCompleted && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </span>

                    {/* Step Info */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <h4 className={`text-sm font-bold ${isCurrent ? 'text-purple-800' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isCompleted ? 'text-gray-600 font-normal' : 'text-gray-400'}`}>
                        {step.desc}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* Right Column: Order Details Summary */}
        <div className="flex flex-col gap-6">
          
          {/* Delivery Boy Details */}
          {currentStepIndex >= 2 && currentStepIndex < 4 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-lg">
                  RK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Ravi Kumar</h4>
                  <span className="text-[10px] text-gray-500">Your Delivery Executive</span>
                  <div className="flex items-center gap-1 mt-1 bg-green-50 text-green-700 px-1 py-0.2 rounded text-[9px] font-bold w-fit">
                    ★ 4.9 (420 rides)
                  </div>
                </div>
              </div>
              <a 
                href="tel:1234567890" 
                className="bg-purple-100 text-purple-700 p-2.5 rounded-full hover:bg-purple-200 transition"
                title="Call Executive"
              >
                <Phone size={16} />
              </a>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left">
            <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-purple-600" /> Destination
            </h4>
            <div className="text-xs">
              <span className="font-bold text-gray-800 block mb-0.5">{order.customer_name}</span>
              <span className="text-gray-600">{order.delivery_address}</span>
              <span className="text-gray-400 block mt-1">Phone: {order.customer_phone}</span>
            </div>
          </div>

          {/* Order Summary (Items List) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left flex flex-col gap-3">
            <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-purple-600" /> Order Summary
            </h4>
            
            <div className="flex flex-col gap-3.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-9 h-9 object-contain rounded border border-gray-100 bg-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</span>
                      <span className="text-[9px] text-gray-400">{item.unit} x {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    ₹{(Number(item.price) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-150 my-1"></div>

            <div className="flex flex-col gap-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>₹{(Number(order.total_amount) - Number(order.delivery_fee) - Number(order.handling_fee)).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fees (Handling + Delivery)</span>
                <span>₹{(Number(order.delivery_fee) + Number(order.handling_fee)).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-purple-900 text-sm mt-1">
                <span>Paid Total</span>
                <span>₹{Number(order.total_amount).toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
