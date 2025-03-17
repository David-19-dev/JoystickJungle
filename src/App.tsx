import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Events from './pages/Events';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import ShopProduct from './pages/ShopProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import TournamentRegistration from './pages/TournamentRegistration';
import SubscriptionRegistration from './pages/SubscriptionRegistration';
import Admin from './pages/Admin';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import SessionCalendar from './pages/SessionCalendar';
import SessionDetails from './pages/SessionDetails';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminSetup from './pages/AdminSetup';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin-setup" element={<AdminSetup />} />

            {/* Gaming Room Management Routes - No Navbar/Footer */}
            <Route path="/sessions" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SessionCalendar />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/:id" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SessionDetails />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AdminLayout>
                  <UserDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <AdminLayout>
                  <OrderHistory />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <AdminLayout>
                  <OrderDetails />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Public Routes - With Navbar/Footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/booking" element={<PublicLayout><Booking /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
            <Route path="/shop/product/:id" element={<PublicLayout><ShopProduct /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/order-success/:id" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
            <Route path="/tournament-registration" element={<PublicLayout><TournamentRegistration /></PublicLayout>} />
            <Route path="/subscription-registration" element={<PublicLayout><SubscriptionRegistration /></PublicLayout>} />
            <Route path="/payment" element={<PublicLayout><Payment /></PublicLayout>} />
            <Route path="/payment-success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
            <Route path="/payment-cancel" element={<PublicLayout><PaymentCancel /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;