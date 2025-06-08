import axiosInstance from '../api/axiosConfig';

const OrderService = {
  placeOrder: async (shippingAddress) => {
    try {
      const response = await axiosInstance.post('/orders', { shippingAddress });
      return response.data; 
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order with ID ${orderId}:`, error);
      throw error;
    }
  }
};

export default OrderService;