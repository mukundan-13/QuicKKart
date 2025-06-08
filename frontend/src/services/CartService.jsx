import axiosInstance from '../api/axiosConfig';

const CartService = {
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      const response = await axiosInstance.post('/cart/add', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItemQuantity: async (productId, quantity) => {
    try {
      const response = await axiosInstance.put('/cart/update', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  },

  removeCartItem: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log('Cart cleared locally or by order placement.');
      return {}; 
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default CartService;
