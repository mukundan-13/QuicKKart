import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, cartLoading, cartError, updateCartItemQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, currentQuantity, newQuantity) => {
    if (newQuantity <= 0) {
      if (window.confirm("Do you want to remove this item from the cart?")) {
        await removeFromCart(productId);
      }
      return;
    }
    await updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      await removeFromCart(productId);
    }
  };

  if (cartLoading) {
    return <div className="container mx-auto p-4 text-center text-xl">Loading cart...</div>;
  }

  if (cartError) {
    return <div className="container mx-auto p-4 text-center text-xl text-red-500">{cartError}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-lg text-gray-600">
          <p className="mb-4">Your cart is empty.</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-300">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            
   
{cartItems
  .filter(item => item.product) 
  .map((item) => (
              <div key={item.product.id} className="flex flex-col sm:flex-row items-center border-b pb-4 last:border-b-0 last:pb-0">
                <div className="w-full sm:w-1/4 flex-shrink-0 mb-4 sm:mb-0">
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={item.product.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md mx-auto sm:mx-0"
                    />
                  </Link>
                </div>
                <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                  <Link to={`/products/${item.product.id}`} className="text-xl font-semibold text-gray-800 hover:text-blue-600">
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity, item.quantity - 1)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.product.id, item.quantity, parseInt(e.target.value) || 0)}
                    className="w-16 text-center border rounded-md py-1"
                    min="0"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity, item.quantity + 1)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <div className="w-full sm:w-1/6 text-center sm:text-right font-bold text-gray-800 mb-4 sm:mb-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                <div className="w-full sm:w-auto text-center sm:text-right">
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-red-600 hover:text-red-800 transition duration-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Total: ${totalPrice.toFixed(2)}</h2>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-semibold transition duration-300"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
