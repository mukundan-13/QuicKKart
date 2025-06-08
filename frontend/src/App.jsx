import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage'; 
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { useAuth } from './context/AuthContext';

const ProfilePage = () =>
   <div className="container mx-auto p-4 text-center text-xl">
    User Profile Page</div>;
const AdminDashboardPage = () => 
<div className="container mx-auto p-4 text-center text-xl">Admin Dashboard (Protected)</div>;
const NotFoundPage = () => 
<div className="container mx-auto p-4 text-center text-xl">404 - Page Not Found</div>;


function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading application...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} /> 
                <Route path="/orders" element={<OrdersPage />} /> 
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

// eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE3NDkzMjIzNjksImV4cCI6MTc0OTQwODc2OX0.Hy4hFDDxxmhrZxUGZcDz0wtJTYZyL24bioFCNNkVBJc