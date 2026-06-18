import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CategoryProductRow({ cat, catProducts, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollLimits = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Show left arrow if we have scrolled right
    setShowLeftArrow(el.scrollLeft > 5);
    
    // Show right arrow if we haven't reached the end
    const maxScroll = el.scrollWidth - el.clientWidth;
    setShowRightArrow(el.scrollLeft < maxScroll - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      checkScrollLimits();
      
      // Run multiple times to handle dynamic content/image loads shifting layout width
      const t1 = setTimeout(checkScrollLimits, 100);
      const t2 = setTimeout(checkScrollLimits, 300);
      const t3 = setTimeout(checkScrollLimits, 800);
      
      window.addEventListener('resize', checkScrollLimits);
      
      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [catProducts]);

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -620 : 620;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="category-row text-left relative mb-6" onMouseEnter={checkScrollLimits}>
      {/* Section Header */}
      <div className="flex justify-between items-center mb-3.5 border-b border-gray-100 pb-2">
        <h4 className="text-base font-extrabold text-purple-950">
          {cat.name}
        </h4>
        <button
          onClick={() => onSelectCategory(cat.id)}
          className="text-[12px] font-extrabold text-pink-600 hover:text-pink-700 transition cursor-pointer"
        >
          See All &gt;
        </button>
      </div>

      {/* Carousel Container Wrapper with relative positioning */}
      <div className="category-carousel-wrapper">
        
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="category-carousel-arrow left active"
            title="Scroll Left"
          >
            <ChevronLeft size={22} strokeWidth={3} />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="category-carousel-arrow right active"
            title="Scroll Right"
          >
            <ChevronRight size={22} strokeWidth={3} />
          </button>
        )}

        {/* Horizontal Scroll Product List */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-3 scrollbar-none"
        >
          {catProducts.map((product) => (
            <div key={product.id} className="category-product-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
