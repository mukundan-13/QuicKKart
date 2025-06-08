import axiosInstance from '../api/axiosConfig'; 

const ProductService = {
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  getProductById: async (productId) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
      throw error;
    }
  },

  getReviewsForProduct: async (productId) => {
    try {
      const response = await axiosInstance.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product with ID ${productId}:`, error);
      throw error;
    }
  },

  submitReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },
};

export default ProductService;