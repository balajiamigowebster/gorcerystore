import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function HeroBanner({ onSelectCategory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
      
      {/* Left Banner: All New Zepto Experience */}
      <div 
        className="rounded-3xl p-6 text-left relative overflow-hidden flex flex-col justify-between shadow-sm border border-purple-100"
        style={{ 
          background: 'linear-gradient(135deg, #f5f0ff 0%, #ede6ff 100%)',
          minHeight: '230px'
        }}
      >
        {/* Banner Top Info */}
        <div className="z-10">
          <span className="text-[10px] font-black text-purple-700 tracking-wider uppercase block">
            ALL NEW AMIGOBASKET EXPERIENCE
          </span>
          
          {/* Two Side-by-side white cards */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            
            {/* Card 1: ₹0 FEES */}
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(122,20,172,0.06)] border border-purple-100/40">
              {/* Bag icon container */}
              <div className="flex-shrink-0 bg-purple-700 text-white rounded-xl w-10 h-12 flex flex-col items-center justify-center font-black italic shadow-sm transform -rotate-3">
                <span className="text-lg">Z</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-purple-950 leading-none">₹0 FEES</h3>
              </div>
            </div>

            {/* Card 2: EVERYDAY LOW PRICES */}
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(122,20,172,0.06)] border border-purple-100/40">
              {/* Starburst icon container */}
              <div className="flex-shrink-0 bg-amber-400 text-purple-950 rounded-xl w-10 h-12 flex flex-col items-center justify-center font-black shadow-sm transform rotate-3">
                <span className="text-sm">⚡</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-purple-950 leading-tight uppercase">
                  EVERYDAY<br/><span className="text-purple-650">LOW</span><br/>PRICES
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Checkmarks List */}
        <div className="z-10 mt-3 flex items-center justify-start gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-900">
            <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>₹0 Handling Fee</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-900">
            <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>₹0 Delivery Fee*</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-900">
            <span className="bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>₹0 Rain & Surge Fee</span>
          </div>
        </div>

        {/* Tiny T&C */}
        <span className="text-[8px] text-purple-600 mt-1 block font-bold">
          *T&C Apply. Above specific minimum order value
        </span>

        {/* Background designs */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-200/40 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Right Banner: Paan Corner */}
      <div 
        className="rounded-3xl p-6 text-white text-left relative overflow-hidden flex flex-col justify-between group cursor-pointer shadow-sm"
        style={{ 
          background: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #090d16 100%)',
          minHeight: '230px'
        }}
        onClick={() => {
          if (onSelectCategory) {
            // Find Paan Corner in categories
            const paanCat = categories?.find(c => c.name === 'Paan Corner');
            if (paanCat) onSelectCategory(paanCat.id);
          }
        }}
      >
        {/* Stadium lighting overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#059669_0%,transparent_60%)] opacity-70 pointer-events-none"></div>

        {/* Banner Top Info */}
        <div className="z-10">
          <h2 className="text-3xl font-black tracking-tight mb-1 text-white">
            Paan Corner
          </h2>
          <p className="text-[12px] font-semibold text-emerald-200 max-w-[240px] leading-snug">
            Get smoking accessories, fresheners & more in Minutes this IPL with Amigobasket!
          </p>
        </div>

        {/* Order Now button & items list */}
        <div className="z-10 mt-4 flex items-end justify-between">
          <button className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-1.5 group-hover:scale-105">
            Order now
          </button>
          
          {/* Mock visual of Ryze box and Cones */}
          <div className="relative w-28 h-20 flex items-end justify-center z-10 mr-12 select-none">
            {/* Cone Box */}
            <div className="absolute right-0 bottom-0 bg-[#eab308] border border-amber-500 rounded-md w-9 h-16 shadow-lg flex flex-col justify-between p-1 transform rotate-6 z-15">
              <span className="text-[5px] font-black text-amber-950 uppercase leading-none text-center">6 BROWN<br/>CONES</span>
              <div className="bg-amber-950 w-full h-1"></div>
            </div>
            {/* Ryze Box */}
            <div className="absolute right-6 bottom-0 bg-[#dc2626] border border-red-700 rounded-md w-10 h-14 shadow-lg flex flex-col justify-between p-1 transform -rotate-12 z-10">
              <span className="text-[7px] font-black text-white italic tracking-tighter">ryze</span>
              <div className="bg-white w-full h-1.5 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Injurious to health warning label */}
        <div className="absolute bottom-0 right-0 bg-white border-t border-l border-red-700 p-1.5 text-[8px] font-black text-red-600 text-center uppercase tracking-tight leading-none z-20 rounded-tl-xl max-w-[120px]">
          Cigarette smoking is injurious to health
        </div>

        {/* Background designs */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-12 top-4 text-4xl opacity-15 transform -rotate-12 pointer-events-none">
          🏏
        </div>

      </div>

    </div>
  );
}
