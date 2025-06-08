import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import CartService from '../services/CartService';
import { useAuth } from './AuthContext'; 

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);

 const calculateTotalPrice = useCallback(() => {
  return cartItems.reduce((total, item) => {
    if (!item.product || typeof item.product.price !== 'number') return total;
    return total + item.product.price * item.quantity;
  }, 0);
}, [cartItems]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || authLoading) { 
      setCartLoading(false);
      setCartItems([]);
      return;
    }
    setCartLoading(true);
    setCartError(null);
    try {
      const data = await CartService.getCart();
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartError('Failed to load cart. Please try again.');
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); 

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      setCartError('You must be logged in to add items to cart.');
      return false;
    }
    setCartError(null);
    try {
      const updatedCart = await CartService.addToCart(productId, quantity);
      setCartItems(updatedCart.cartItems || []); 
      return true;
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to add item to cart.');
      console.error('Add to cart error:', error);
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) {
      setCartError('You must be logged in to update cart items.');
      return false;
    }
    setCartError(null);
    try {
      const updatedCart = await CartService.updateCartItemQuantity(productId, newQuantity);
      setCartItems(updatedCart.cartItems || []);
      return true;
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to update item quantity.');
      console.error('Update cart quantity error:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      setCartError('You must be logged in to remove items from cart.');
      return false;
    }
    setCartError(null);
    try {
      const updatedCart = await CartService.removeCartItem(productId);
      setCartItems(updatedCart.cartItems || []);
      return true;
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to remove item from cart.');
      console.error('Remove from cart error:', error);
      return false;
    }
  };

  const clearLocalCart = () => {
    setCartItems([]);
  };

  const cartTotalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        fetchCart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearLocalCart,
        totalPrice: calculateTotalPrice(),
        cartTotalItems 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
