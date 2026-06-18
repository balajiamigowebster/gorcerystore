import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Smartphone, User, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useCart();
  const [step, setStep] = useState(1); // 1 = Name/Phone, 2 = OTP Entry
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(2);
      }, 1000);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        login({ name, phone });
        onClose();
        // Reset states
        setName('');
        setPhone('');
        setOtp('');
        setStep(1);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center animate-fade-in p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl z-50 p-6 text-left">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-black text-gray-800">
              {step === 1 ? 'Login / Signup' : 'OTP Verification'}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {step === 1 ? 'Enter your details to track orders' : `OTP sent to +91 ${phone}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Input details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5 flex items-center gap-1">
                <User size={12} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="input-field py-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5 flex items-center gap-1">
                <Smartphone size={12} /> Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-650 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-extrabold flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  required
                  className="input-field flex-grow py-2.5 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-purple-800 hover:bg-purple-900 text-white font-bold p-3 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Entry */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={4}
                pattern="[0-9]{4}"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit mock code (e.g. 1234)"
                required
                autoFocus
                className="input-field tracking-widest text-center text-lg font-bold py-2"
              />
            </div>

            <div className="flex gap-3 mt-1 text-[10px] text-gray-500 font-semibold justify-between">
              <span>Didn't receive code?</span>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-purple-700 hover:underline"
              >
                Change details
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length < 4}
              className={`bg-purple-800 hover:bg-purple-900 text-white font-bold p-3 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 ${
                isSubmitting || otp.length < 4 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Verify & Submit'
              )}
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-bold">
          <ShieldCheck size={14} className="text-gray-300" /> Securing your identity via mock verification
        </div>

      </div>
    </div>
  );
}
