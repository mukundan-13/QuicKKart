import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartTotalItems } = useCart();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold hover:text-blue-200 transition duration-300">
          QuicKKart
        </Link>
        <div className="space-x-4 flex items-center">
          <Link to="/products" className="text-white hover:text-blue-200 transition duration-300">Products</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="text-white hover:text-blue-200 transition duration-300 relative">
                Cart
                {cartTotalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                )}
              </Link>
              {/* <Link to="/wishlist" className="text-white hover:text-blue-200 transition duration-300">Wishlist</Link> */}
              <Link to="/orders" className="text-white hover:text-blue-200 transition duration-300">My Orders</Link>
              <Link to="/profile" className="text-white hover:text-blue-200 transition duration-300">Profile</Link>
              {isAdmin && (
                <Link to="/admin" className="text-white hover:text-blue-200 transition duration-300 font-semibold">Admin</Link>
              )}
              <span className="text-white text-sm">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition duration-300">Login</Link>
              <Link to="/register" className="border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-600 transition duration-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;