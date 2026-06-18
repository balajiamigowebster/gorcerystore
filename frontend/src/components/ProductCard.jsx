import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Star, Zap } from 'lucide-react';

export default function ProductCard({ product, onOpenDetails }) {
  const { cartItems, addToCart, removeFromCart } = useCart();
  
  const cartItem = cartItems.find(
    (item) => Number(item.id) === Number(product.id) && item.selectedUnit === (product.selectedUnit || product.unit)
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const originalPrice = Number(product.price);
  const discountPrice = product.discount_price !== null ? Number(product.discount_price) : null;
  const activePrice = discountPrice !== null ? discountPrice : originalPrice;

  // Calculate discount amount
  const discountAmount = discountPrice !== null ? Math.round(originalPrice - discountPrice) : 0;

  return (
    <div 
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="product-card bg-white select-none cursor-pointer"
    >
      
      {/* Product Image Wrapper */}
      <div className="product-image-wrapper">
        {/* Product Image Container */}
        <div className="product-image-container">
          <img
            src={product.image_url}
            alt={product.name}
            className={product.is_fresh ? 'object-cover' : 'object-contain'}
            loading="lazy"
          />

          {/* Badge Top Left */}
          <div className="product-badge-container">
            {product.is_bestseller ? (
              <span className="bestseller-badge">Bestseller</span>
            ) : (
              <span className="zap-badge">
                <Zap size={10} className="zap-badge-icon" /> 10 MINS
              </span>
            )}
          </div>
        </div>

        {/* Overlaid ADD / Quantity Button */}
        <div className="product-card-action-container">
          {quantity === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="product-add-btn"
            >
              ADD
            </button>
          ) : (
            <div className="product-qty-selector">
              <button
                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id, product.selectedUnit || product.unit); }}
                className="product-qty-btn"
              >
                <Minus size={10} className="stroke-[3]" />
              </button>
              <span className="product-qty-val">{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className="product-qty-btn"
              >
                <Plus size={10} className="stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content details wrapper */}
      <div className="product-info-container">
        
        {/* Prices Row */}
        <div className="product-price-row">
          <span className="price-badge">₹{activePrice.toFixed(0)}</span>
          {discountPrice !== null && (
            <span className="original-price">₹{originalPrice.toFixed(0)}</span>
          )}
        </div>

        {/* Discount Amount Row */}
        {discountAmount > 0 && (
          <div className="discount-off">₹{discountAmount} OFF</div>
        )}

        {/* Product Title */}
        <h4 className="product-title line-clamp-2" title={product.name}>
          {product.name}
        </h4>

        {/* Pack / Size Unit */}
        <span className="product-unit">
          {product.unit}
        </span>

        {/* Footer special tags or ratings */}
        {product.special_tag ? (
          <div className="product-special-tag-container">
            <span className="product-special-tag">
              {product.special_tag}
            </span>
          </div>
        ) : product.rating ? (
          <div className="product-rating-line">
            <Star size={11} className="fill-green-600 text-green-600 inline" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span className="text-gray-400 font-normal ml-0.5">{product.rating_count}</span>
          </div>
        ) : null}

      </div>

    </div>
  );
}
