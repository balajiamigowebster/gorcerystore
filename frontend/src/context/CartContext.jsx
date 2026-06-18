import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('zepto_cart');
    if (!savedCart) return [];
    try {
      const items = JSON.parse(savedCart);
      return Array.isArray(items) ? items.map(item => ({
        ...item,
        id: Number(item.id)
      })).filter(item => !isNaN(item.id)) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    return localStorage.getItem('zepto_address') || 'Select Location - Bangalore';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('zepto_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('zepto_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => Number(item.id) === Number(product.id));
      if (existingItem) {
        return prevItems.map((item) =>
          Number(item.id) === Number(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, id: Number(product.id), quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => Number(item.id) === Number(productId));
      if (!existingItem) return prevItems;
      if (existingItem.quantity === 1) {
        return prevItems.filter((item) => Number(item.id) !== Number(productId));
      }
      return prevItems.map((item) =>
        Number(item.id) === Number(productId) ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => Number(item.id) !== Number(productId)));
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        Number(item.id) === Number(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('zepto_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zepto_user');
  };

  const saveAddress = (address) => {
    setDeliveryAddress(address);
    localStorage.setItem('zepto_address', address);
  };

  // Calculations
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.discount_price !== null ? Number(item.discount_price) : Number(item.price);
    return acc + itemPrice * item.quantity;
  }, 0);

  const deliveryFee = cartSubtotal >= 199 || cartSubtotal === 0 ? 0 : 29;
  const handlingFee = cartSubtotal === 0 ? 0 : 4.00;
  const cartTotal = cartSubtotal + deliveryFee + handlingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        cartSubtotal,
        deliveryFee,
        handlingFee,
        cartTotal,
        deliveryAddress,
        user,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        login,
        logout,
        saveAddress
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
