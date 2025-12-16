import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import HomePage from './pages/home/HomePage'
import CataloguePage from './pages/catalogue/CataloguePage'
import CartPage from './pages/cart/CartPage'
import AccountPage from './pages/account/AccountPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import SupportPage from './pages/SupportPage'
import B2BPage from './pages/B2BPage'
import B2BDashboard from './pages/B2BDashboard'
import BulkOrderPage from './pages/BulkOrderPage'
import ContactPage from './pages/ContactPage'
import HowItWorksPage from './pages/HowItWorksPage'
import NotFoundPage from './pages/NotFoundPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminDishes from './pages/admin/AdminDishes'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminReviews from './pages/admin/AdminReviews'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminB2B from './pages/admin/AdminB2B'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="dishes" element={<AdminDishes />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="delivery" element={<AdminDelivery />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="b2b" element={<AdminB2B />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Public Routes - With Header/Footer */}
            <Route
              path="*"
              element={
                <Box minH="100vh" display="flex" flexDirection="column">
                  <Header />
                  <Box flex="1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/catalogue" element={<CataloguePage />} />
                      <Route path="/panier" element={<CartPage />} />
                      <Route path="/compte" element={<AccountPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                      <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/support/:ticketId" element={<SupportPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/how-it-works" element={<HowItWorksPage />} />
                      <Route path="/b2b" element={<B2BPage />} />
                      <Route path="/b2b/dashboard" element={<B2BDashboard />} />
                      <Route path="/b2b/bulk-order" element={<BulkOrderPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Box>
                  <Footer />
                </Box>
              }
            />
          </Routes>
          <PWAInstallPrompt />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
