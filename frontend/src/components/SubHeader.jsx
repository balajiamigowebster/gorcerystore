import React from 'react';
import { ShoppingBag, Coffee, Home, ToyBrick, Leaf, Headphones, Smartphone, Sparkles, Shirt } from 'lucide-react';

const SUB_HEADER_ITEMS = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'toys', label: 'Toys', icon: ToyBrick },
  { id: 'fresh', label: 'Fresh', icon: Leaf },
  { id: 'electronics', label: 'Electronics', icon: Headphones },
  { id: 'mobiles', label: 'Mobiles', icon: Smartphone },
  { id: 'beauty', label: 'Beauty', icon: Sparkles },
  { id: 'fashion', label: 'Fashion', icon: Shirt }
];

export default function SubHeader({ activeTab, onSelectTab }) {
  return (
    <div className="bg-white border-b border-gray-100 py-2.5 overflow-x-auto scrollbar-none sticky top-[61px] z-40">
      <div className="container flex items-center justify-start md:justify-center gap-8 px-4">
        {SUB_HEADER_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 text-[13px] font-medium transition duration-150 whitespace-nowrap py-1 ${
                isActive 
                  ? 'text-purple-700 font-bold border-b-2 border-purple-700' 
                  : 'text-gray-500 hover:text-purple-700'
              }`}
            >
              <IconComponent size={15} className={isActive ? 'text-purple-700' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
