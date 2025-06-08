import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 

const ProductCard = ({ product }) => {
  const { addToCart, cartError } = useCart(); 
  const [addingToCart, setAddingToCart] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setAddMessage('');
    try {
      const success = await addToCart(product.id, 1);
      if (success) {
        setAddMessage('Added to cart!');
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/250x200?text=No+Image'}
          alt={product.name}
          className="w-full h-48 object-cover object-center"
        />
      </Link>
      <div className="p-4 flex-grow flex flex-col">
        <Link to={`/products/${product.id}`} className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300 line-clamp-2">
          {product.name}
        </Link>
        <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
        <div className="flex items-center mt-2 mb-4">
          {product.averageRating ? (
            <span className="text-yellow-500 font-bold mr-1">{product.averageRating.toFixed(1)}</span>
          ) : (
            <span className="text-gray-400 mr-1">No rating</span>
          )}
          <span className="text-gray-500">({product.reviewCount || 0} reviews)</span>
        </div>
        <div className="mt-auto flex flex-col sm:flex-row gap-2"> 
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm w-full disabled:opacity-50"
            disabled={addingToCart}
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${product.id}`}
            className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-300 text-sm text-center w-full"
          >
            Details
          </Link>
        </div>
        {addMessage && (
          <p className={`text-sm mt-2 text-center ${addMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
            {addMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;