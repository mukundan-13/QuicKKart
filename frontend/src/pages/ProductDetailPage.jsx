import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import ProductService from '../services/ProductService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cartError } = useCart(); 

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1); 
  const [addingToCart, setAddingToCart] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmissionError, setReviewSubmissionError] = useState('');
  const [reviewSubmissionSuccess, setReviewSubmissionSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const productData = await ProductService.getProductById(id);
      setProduct(productData);
      const reviewsData = await ProductService.getReviewsForProduct(id);
      setReviews(reviewsData);
    } catch (err) {
      setError('Failed to fetch product details or reviews.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setAddMessage('');
    try {
      const success = await addToCart(product.id, quantity);
      if (success) {
        setAddMessage(`${quantity} item(s) added to cart!`);
      } else {
        setAddMessage(cartError || 'Failed to add to cart.');
      }
    } catch (error) {
      setAddMessage('Failed to add to cart.');
      console.error(error);
    } finally {
      setAddingToCart(false);
      setTimeout(() => setAddMessage(''), 3000); 
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmissionError('');
    setReviewSubmissionSuccess('');
    setSubmittingReview(true);

    if (!isAuthenticated) {
      setReviewSubmissionError('You must be logged in to submit a review.');
      setSubmittingReview(false);
      return;
    }

    try {
      const reviewData = {
        productId: product.id,
        rating: newReviewRating,
        comment: newReviewComment,
      };
      await ProductService.submitReview(reviewData);
      setReviewSubmissionSuccess('Review submitted successfully!');
      setNewReviewRating(5);
      setNewReviewComment('');
      await fetchProductAndReviews(); 
    } catch (err) {
      setReviewSubmissionError(err.response?.data?.message || 'Failed to submit review.');
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) {
    return <div className="container mx-auto p-4 text-center text-xl">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-xl text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-4 text-center text-xl text-gray-600">Product not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.imageUrl || 'url'}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-gray-600 text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
          <div className="flex items-center mb-4">
            {product.averageRating ? (
              <span className="text-yellow-500 text-xl font-bold mr-2">{product.averageRating.toFixed(1)}</span>
            ) : (
              <span className="text-gray-400 text-xl mr-2">No rating</span>
            )}
            <span className="text-gray-500 text-lg">({product.reviewCount || 0} reviews)</span>
          </div>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">{product.description}</p>

          <div className="mb-4">
            <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
              className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 text-lg flex-grow disabled:opacity-50"
              disabled={addingToCart || product.stockQuantity === 0}
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : (addingToCart ? 'Adding...' : 'Add to Cart')}
            </button>
            <button className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition duration-300 text-lg flex-grow">
              Add to Wishlist
            </button>
          </div>
          {addMessage && (
            <p className={`text-sm mt-2 text-center ${addMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
              {addMessage}
            </p>
          )}

          <p className="text-gray-500 text-sm mt-4">
            In Stock: <span className="font-semibold">{product.stockQuantity}</span>
          </p>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Submit Your Review</h3>
            {reviewSubmissionError && <p className="text-red-500 text-sm mb-3">{reviewSubmissionError}</p>}
            {reviewSubmissionSuccess && <p className="text-green-500 text-sm mb-3">{reviewSubmissionSuccess}</p>}
            <div className="mb-4">
              <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">Rating (1-5 Stars)</label>
              <input
                type="number"
                id="rating"
                min="1"
                max="5"
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
              <textarea
                id="comment"
                rows="4"
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                placeholder="Share your thoughts about this product..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50"
              disabled={submittingReview}
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{review.userName}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-yellow-500 font-bold mb-1">
                  {'⭐'.repeat(review.rating)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

