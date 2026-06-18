import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, ChevronDown, Share2, Bookmark, Plus, Minus, Star, ChevronRight } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Parse variants from product or default to base product
  const variants = React.useMemo(() => {
    if (!product) return [];
    if (product.variants) {
      try {
        return typeof product.variants === 'string' 
          ? JSON.parse(product.variants) 
          : product.variants;
      } catch (e) {
        console.error('Failed to parse variants JSON', e);
      }
    }
    // Default fallback
    return [{
      unit: product.unit,
      price: Number(product.price),
      discount_price: product.discount_price !== null ? Number(product.discount_price) : null
    }];
  }, [product]);

  // Set default selected variant when modal opens
  useEffect(() => {
    if (isOpen && variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [isOpen, variants]);

  if (!isOpen || !product) return null;

  // Helpers
  const brandName = product.name.split(' ')[0];
  const activePrice = selectedVariant 
    ? (selectedVariant.discount_price !== null ? selectedVariant.discount_price : selectedVariant.price)
    : Number(product.price);
  
  const originalPrice = selectedVariant ? selectedVariant.price : Number(product.price);
  const isDiscounted = selectedVariant 
    ? selectedVariant.discount_price !== null 
    : product.discount_price !== null;

  // Find cart quantity of current selected variant
  const currentUnit = selectedVariant ? selectedVariant.unit : product.unit;
  const cartItem = cartItems.find(
    (item) => Number(item.id) === Number(product.id) && item.selectedUnit === currentUnit
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  // Calculate price per 100g / 100ml / piece
  function getPricePerUnit(price, unitStr) {
    const match = unitStr.match(/([\d\.]+)\s*(g|kg|ml|l|pcs|pc)/i);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const measure = match[2].toLowerCase();
    
    let totalGrams = value;
    if (measure === 'kg' || measure === 'l') {
      totalGrams = value * 1000;
    }
    
    if (measure === 'pcs' || measure === 'pc') {
      const perPiece = (price / value).toFixed(0);
      return `₹${perPiece}/pc`;
    }
    
    const pricePer100g = (price / totalGrams) * 100;
    const formattedPrice = pricePer100g % 1 === 0 ? pricePer100g.toFixed(0) : pricePer100g.toFixed(1);
    return `₹${formattedPrice}/100 g`;
  }

  const pricePerUnitStr = getPricePerUnit(activePrice, currentUnit);

  const handleAdd = () => {
    // Create a product object with variant pricing details to add to the cart
    const productToCart = {
      ...product,
      selectedUnit: currentUnit,
      selectedPrice: selectedVariant ? selectedVariant.price : Number(product.price),
      selectedDiscountPrice: selectedVariant ? selectedVariant.discount_price : product.discount_price
    };
    addToCart(productToCart);
  };

  const handleRemove = () => {
    removeFromCart(product.id, currentUnit);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center animate-fade-in p-0 md:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      
      {/* Bottom Sheet on Mobile / Centered Modal on Desktop */}
      <div 
        className="relative bg-white w-full md:max-w-md shadow-2xl z-50 overflow-hidden flex flex-col text-left rounded-t-3xl md:rounded-3xl"
        style={{
          maxHeight: '92vh',
          height: 'auto',
          animation: 'fadeInModal 0.25s ease-out'
        }}
      >
        {/* Navigation Action Header */}
        <div className="p-4 flex items-center justify-between z-10 bg-white">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition duration-150"
            title="Close details"
          >
            <ChevronDown size={22} className="stroke-[2.5]" />
          </button>
          
          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition">
              <Bookmark size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-grow overflow-y-auto px-5 pb-6">
          
          {/* Main Large Product Image */}
          <div className="relative w-full h-64 md:h-72 flex items-center justify-center bg-[#fcfcfd] rounded-2xl overflow-hidden select-none border border-gray-100/40">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="max-h-[85%] max-w-[85%] object-contain rounded-xl"
            />
            
            {/* Promo Fasting Badge */}
            {product.is_bestseller ? (
              <span className="absolute top-4 right-4 bg-pink-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full shadow-sm">
                BESTSELLER
              </span>
            ) : product.is_fresh ? (
              <div className="absolute top-4 right-4 bg-pink-700 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center font-bold text-[8px] leading-tight text-center shadow-md p-1">
                <span>Fasting</span>
                <span>Special</span>
              </div>
            ) : null}

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#0052fe] rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
            </div>
          </div>

          {/* 12 MINS / RATING Info Row */}
          <div className="flex items-center justify-end gap-3 mt-3 text-[11px] font-black text-gray-500">
            <span>12 MINS</span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-0.5 text-green-700">
              <Star size={11} className="fill-green-700 text-green-700" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              <span className="text-gray-400 font-semibold">{product.rating_count || '(9.2k)'}</span>
            </div>
          </div>

          {/* Explore all brand items */}
          <button className="text-xs font-bold text-[#0052fe] hover:underline flex items-center gap-0.5 mt-2 bg-transparent text-left">
            Explore all {brandName} items <ChevronRight size={14} className="stroke-[2.5]" />
          </button>

          {/* Title */}
          <h2 className="text-lg font-black text-gray-900 leading-snug mt-1.5">
            {product.name}
          </h2>

          {/* Subtitle current selected variant */}
          <span className="text-[11px] text-gray-400 font-bold block mt-1">
            Quantity: {currentUnit}
          </span>

          {/* Variants Selector Header */}
          <div className="mt-4">
            <div className="flex flex-row gap-3 overflow-x-auto pb-1">
              {variants.map((v, idx) => {
                const isSelected = selectedVariant && selectedVariant.unit === v.unit;
                const vActivePrice = v.discount_price !== null ? v.discount_price : v.price;
                const vPricePerUnit = getPricePerUnit(vActivePrice, v.unit);

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 min-w-[95px] flex-1 text-left ${
                      isSelected 
                        ? 'border-[#0052fe] bg-white shadow-xs' 
                        : 'border-gray-200/80 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{v.unit}</h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-black text-gray-900">₹{vActivePrice.toFixed(0)}</span>
                        {v.discount_price !== null && (
                          <span className="text-[9px] text-gray-400 font-bold line-through">₹{v.price.toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                    
                    {vPricePerUnit && (
                      <span className="text-[9px] text-gray-400 font-bold mt-1.5 block">{vPricePerUnit}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-5"></div>

          {/* Bottom Call-To-Action Row */}
          <div className="flex items-center justify-between bg-white rounded-2xl">
            <div className="text-left">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-gray-900">₹{activePrice.toFixed(0)}</span>
                {isDiscounted && (
                  <span className="text-xs text-gray-400 font-bold line-through">₹{originalPrice.toFixed(0)}</span>
                )}
              </div>
              {pricePerUnitStr && (
                <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{pricePerUnitStr}</span>
              )}
            </div>

            {/* ADD / Quantity Button */}
            <div>
              {quantity === 0 ? (
                <button 
                  onClick={handleAdd}
                  className="bg-[#0052fe] hover:bg-[#0047df] text-white font-extrabold text-xs px-8 py-3 rounded-xl shadow-[0_2px_8px_rgba(0,82,254,0.2)] transition duration-200 cursor-pointer flex items-center justify-center min-w-[110px]"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center bg-[#0052fe] text-white rounded-xl shadow-[0_2px_8px_rgba(0,82,254,0.2)] px-2 py-1.5 min-w-[110px] justify-between">
                  <button 
                    onClick={handleRemove}
                    className="p-1 text-white hover:text-blue-100 transition cursor-pointer"
                  >
                    <Minus size={12} className="stroke-[3]" />
                  </button>
                  <span className="text-xs font-black px-2">{quantity}</span>
                  <button 
                    onClick={handleAdd}
                    className="p-1 text-white hover:text-blue-100 transition cursor-pointer"
                  >
                    <Plus size={12} className="stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Offers Block */}
          <div className="mt-5 border border-dashed border-[#0052fe]/20 bg-[#0052fe]/[0.01] rounded-2xl p-3.5 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-[#0052fe] font-black text-xs">
                Offer
              </div>
              <div>
                <h4 className="text-[11px] font-black text-gray-800 flex items-center gap-1">
                  Payment Offers <ChevronRight size={12} className="text-[#0052fe] stroke-[2.5]" />
                </h4>
                <span className="text-[10px] text-[#0052fe] font-black mt-0.5 block">Use SBI Card to get ₹150 OFF</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
