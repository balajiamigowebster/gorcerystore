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
      const targetUnit = product.selectedUnit || product.unit;
      const targetPrice = product.selectedPrice !== undefined ? Number(product.selectedPrice) : Number(product.price);
      const targetDiscountPrice = product.selectedDiscountPrice !== undefined 
        ? (product.selectedDiscountPrice !== null ? Number(product.selectedDiscountPrice) : null)
        : (product.discount_price !== null ? Number(product.discount_price) : null);

      const existingItem = prevItems.find(
        (item) => Number(item.id) === Number(product.id) && item.selectedUnit === targetUnit
      );

      if (existingItem) {
        return prevItems.map((item) =>
          Number(item.id) === Number(product.id) && item.selectedUnit === targetUnit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newCartItem = {
        ...product,
        id: Number(product.id),
        selectedUnit: targetUnit,
        price: targetPrice,
        discount_price: targetDiscountPrice,
        quantity: 1
      };
      return [...prevItems, newCartItem];
    });
  };

  const removeFromCart = (productId, selectedUnit = null) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => Number(item.id) === Number(productId) && 
                  (selectedUnit === null || item.selectedUnit === selectedUnit)
      );

      if (!existingItem) return prevItems;
      const targetUnit = existingItem.selectedUnit;

      if (existingItem.quantity === 1) {
        return prevItems.filter(
          (item) => !(Number(item.id) === Number(productId) && item.selectedUnit === targetUnit)
        );
      }

      return prevItems.map((item) =>
        Number(item.id) === Number(productId) && item.selectedUnit === targetUnit
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const updateQuantity = (productId, selectedUnit, quantity) => {
    if (quantity <= 0) {
      setCartItems((prevItems) =>
        prevItems.filter((item) => !(Number(item.id) === Number(productId) && item.selectedUnit === selectedUnit))
      );
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        Number(item.id) === Number(productId) && item.selectedUnit === selectedUnit
          ? { ...item, quantity }
          : item
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
