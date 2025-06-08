import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderService from '../services/OrderService';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, totalPrice, cartLoading, cartError, clearLocalCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderPlacementError, setOrderPlacementError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      setShippingAddress(user.address || '');
      setPhoneNumber(user.phoneNumber || '');
    }

    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart'); 
    }
  }, [cartLoading, cartItems.length, user, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderPlacementError('');
    setPlacingOrder(true);

    if (cartItems.length === 0) {
      setOrderPlacementError('Your cart is empty. Please add items before checking out.');
      setPlacingOrder(false);
      return;
    }

    if (!shippingAddress || !phoneNumber) {
      setOrderPlacementError('Shipping address and phone number are required.');
      setPlacingOrder(false);
      return;
    }

    try {
      const orderData = await OrderService.placeOrder({
        address: shippingAddress,
        phoneNumber: phoneNumber
      });

      clearLocalCart();
      navigate(`/orders`); 

    } catch (error) {
      setOrderPlacementError(error.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setPlacingOrder(false);
    }
  };


  if (cartLoading) {
    return <div className="container mx-auto p-4 text-center text-xl">Loading checkout details...</div>;
  }

  if (cartError) {
    return <div className="container mx-auto p-4 text-center text-xl text-red-500">{cartError}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center text-lg text-gray-600">
        Your cart is empty. Redirecting to shopping...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map(item => (
  <div key={item.id}>
    <h3>{item.productName}</h3>
    <img src={item.productImageUrl} alt={item.productName} />
    <p>Quantity: {item.quantity}</p>
    <p>Price: ₹{item.price}</p>
    <p>Subtotal: ₹{item.subtotal}</p>
  </div>
))}

          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
            <span className="text-xl font-bold text-gray-800">Total:</span>
            <span className="text-xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Information</h2>
          <form onSubmit={handlePlaceOrder}>
            {orderPlacementError && <p className="text-red-500 text-sm mb-4">{orderPlacementError}</p>}
            <div className="mb-4">
              <label htmlFor="shippingAddress" className="block text-gray-700 text-sm font-bold mb-2">Shipping Address</label>
              <textarea
                id="shippingAddress"
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                placeholder="Enter your full shipping address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="mb-6">
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="text"
                id="phoneNumber"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition duration-300 disabled:opacity-50"
                disabled={placingOrder}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
