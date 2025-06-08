import React, { useState, useEffect } from 'react';
import OrderService from '../services/OrderService';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await OrderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); 

  if (loading) {
    return <div className="container mx-auto p-4 text-center text-xl">Loading your orders...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center text-lg text-gray-600">
          <p className="mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-300">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    Order Date: {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  Total: ${order.totalAmount.toFixed(2)}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Items:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="text-gray-600">
                      <Link to={`/products/${item.productId}`} className="text-blue-600 hover:underline">
                        {item.productName}
                      </Link>
                      - ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address:</h3>
                <p className="text-gray-700">{order.shippingAddress}</p>
                <p className="text-gray-700">Phone: {order.phoneNumber}</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

