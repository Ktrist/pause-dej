import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
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
import NotFoundPage from './pages/NotFoundPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminDishes from './pages/admin/AdminDishes'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminAnalytics from './pages/admin/AdminAnalytics'

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
              <Route path="delivery" element={<AdminDelivery />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              {/* Additional admin routes will be added here */}
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
                      <Route path="/b2b" element={<B2BPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Box>
                  <Footer />
                </Box>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
