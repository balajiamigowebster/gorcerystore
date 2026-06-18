import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';

const CATEGORY_IMAGES = {
  'Fruits & Vegetables': 'https://cdn.zeptonow.com/production/cms/category/38047553-95f3-47c6-a1ff-4794e1227d3a.png?tr=f-webp',
  'Dairy, Bread & Eggs': 'https://cdn.zeptonow.com/production/cms/category/474e6e58-1894-4378-86f1-168cc7266d1a.png?tr=f-webp',
  'Atta, Rice, Oil & Dals': 'https://cdn.zeptonow.com/production/cms/category/dc4a299d-521f-4a64-8205-c5ba8e1d13e3.png?tr=f-webp',
  'Meat, Fish & Eggs': 'https://cdn.zeptonow.com/production/cms/category/1237afd6-40bf-4942-a266-25f23025e86c.png?tr=f-webp',
  'Masala & Dry Fruits': 'https://cdn.zeptonow.com/production/cms/category/8d4d3977-5197-49d9-9867-8a670524e48b.png?tr=f-webp',
  'Breakfast & Sauces': 'https://cdn.zeptonow.com/production/cms/category/ab241d87-da5b-4830-b38f-1a6cd30d0d41.png?tr=f-webp',
  'Packaged Food': 'https://cdn.zeptonow.com/production/cms/category/3b0ce887-3b38-4450-b7da-9da0ad8b799d.png?tr=f-webp',
  'Zepto Cafe': 'https://cdn.zeptonow.com/production/cms/category/031c2a24-d40f-4272-8c71-8a566252495e.png?tr=f-webp',
  'Tea, Coffee & More': 'https://cdn.zeptonow.com/production/cms/category/f078a8dc-a9b6-41a6-9c6f-721d4892b8ee.png?tr=f-webp',
  'Ice Cream & More': 'https://cdn.zeptonow.com/production/cms/category/db346f5e-644f-426a-85af-92d707e086ac.png?tr=f-webp',
  'Ice Creams & More': 'https://cdn.zeptonow.com/production/cms/category/db346f5e-644f-426a-85af-92d707e086ac.png?tr=f-webp',
  'Frozen Food': 'https://cdn.zeptonow.com/production/cms/category/366e5b7d-2028-4935-b9f1-75bfa085c3d7.png?tr=f-webp'
};

const MAIN_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy, Bread & Eggs',
  'Atta, Rice, Oil & Dals',
  'Meat, Fish & Eggs',
  'Masala & Dry Fruits',
  'Breakfast & Sauces',
  'Packaged Food',
  'Zepto Cafe',
  'Tea, Coffee & More',
  'Ice Cream & More',
  'Ice Creams & More',
  'Frozen Food'
];

export default function CategoryGrid({ categories, activeCategory, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const filteredCategories = categories
    .filter(cat => MAIN_CATEGORIES.includes(cat.name))
    .sort((a, b) => {
      let idxA = MAIN_CATEGORIES.indexOf(a.name);
      let idxB = MAIN_CATEGORIES.indexOf(b.name);
      if (a.name === 'Ice Cream & More' || a.name === 'Ice Creams & More') idxA = 9;
      if (b.name === 'Ice Cream & More' || b.name === 'Ice Creams & More') idxB = 9;
      return idxA - idxB;
    });

  const checkScrollLimits = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollLeft < (el.scrollWidth - el.clientWidth - 10));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      checkScrollLimits();
      
      // Run multiple times to handle dynamic content/image loads shifting layout width
      const t1 = setTimeout(checkScrollLimits, 100);
      const t2 = setTimeout(checkScrollLimits, 400);
      
      // Handle resizing window
      window.addEventListener('resize', checkScrollLimits);
      
      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [filteredCategories]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-white rounded-3xl p-4 shadow-sm border border-gray-100 my-6" onMouseEnter={checkScrollLimits}>
      
      {/* Left Navigation Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="category-grid-arrow left"
          title="Scroll Left"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="category-grid-arrow right"
          title="Scroll Right"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      )}

      {/* Grid: Flex Horizontal Scrollable */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-1 scrollbar-none"
      >
        
        {/* All Products Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className="flex-shrink-0 flex flex-col items-center select-none group w-20 md:w-24 cursor-pointer"
        >
          {/* Square Image Box */}
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center bg-purple-50 border transition-all duration-200 group-hover:scale-105 ${
            activeCategory === null 
              ? 'border-purple-600 shadow-sm bg-purple-100/50' 
              : 'border-gray-100 bg-[#f4f6fb] hover:bg-purple-50'
          }`}>
            <Grid size={28} className="text-purple-600" />
          </div>
          {/* Label below the box */}
          <span className="text-[11px] font-bold text-gray-800 text-center leading-tight mt-2 line-clamp-2 group-hover:text-purple-800 transition-colors">
            All Items
          </span>
        </button>

        {/* Dynamic categories fetched from DB */}
        {filteredCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const imageUrl = CATEGORY_IMAGES[cat.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex-shrink-0 flex flex-col items-center select-none group w-20 md:w-24 cursor-pointer"
            >
              {/* Square Image Box */}
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${
                isActive 
                  ? 'border-purple-600 shadow-sm bg-white' 
                  : 'border-gray-100 bg-[#f8fafc] hover:bg-gray-100/80'
              }`}>
                <img 
                  src={imageUrl} 
                  alt={cat.name} 
                  className="w-full h-full object-contain rounded-xl p-1"
                />
              </div>
              {/* Label below the box */}
              <span className="text-[11px] font-bold text-gray-800 text-center leading-tight mt-2 line-clamp-2 group-hover:text-purple-800 transition-colors">
                {cat.name}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}
