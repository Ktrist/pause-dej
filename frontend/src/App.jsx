import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CartDrawerProvider } from './context/CartDrawerContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import ScrollToTop from './components/common/ScrollToTop'
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
import AdminB2BQuotes from './pages/admin/AdminB2BQuotes'
import AdminB2BAccounts from './pages/admin/AdminB2BAccounts'
import AdminB2BAnalytics from './pages/admin/AdminB2BAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPromoCodes from './pages/admin/AdminPromoCodes'

// B2B Business pages
import B2BQuoteRequestPage from './pages/B2BQuoteRequestPage'
import EmployeeManagement from './pages/EmployeeManagement'
import BudgetManagement from './pages/BudgetManagement'
import B2BAnalytics from './pages/B2BAnalytics'
import MonthlyInvoices from './pages/MonthlyInvoices'

// Legal pages
import MentionsLegalesPage from './pages/legal/MentionsLegalesPage'
import CGVPage from './pages/legal/CGVPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import CookiesPage from './pages/legal/CookiesPage'

function App() {
  console.log('🟢 App loaded - Routes configured')

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <CartDrawerProvider>
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
              <Route path="b2b/quotes" element={<AdminB2BQuotes />} />
              <Route path="b2b/accounts" element={<AdminB2BAccounts />} />
              <Route path="b2b/analytics" element={<AdminB2BAnalytics />} />
              <Route path="promo-codes" element={<AdminPromoCodes />} />
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

                      {/* New Routes */}
                      <Route path="/a-la-carte" element={<CataloguePage />} />
                      <Route path="/comment-ca-marche" element={<HowItWorksPage />} />

                      {/* Redirects from old URLs */}
                      <Route path="/catalogue" element={<Navigate to="/a-la-carte" replace />} />
                      <Route path="/how-it-works" element={<Navigate to="/comment-ca-marche" replace />} />
                      <Route path="/b2b" element={<Navigate to="/pause-dej-at-work" replace />} />
                      <Route path="/b2b/*" element={<Navigate to="/pause-dej-at-work" replace />} />
                      <Route path="/B2B" element={<Navigate to="/pause-dej-at-work" replace />} />

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

                      {/* B2B Public Routes */}
                      <Route path="/pause-dej-at-work" element={<B2BPage />} />
                      <Route path="/pause-dej-at-work/quote" element={<B2BQuoteRequestPage />} />

                      {/* B2B Business Routes (Protected) */}
                      <Route path="/pause-dej-at-work/dashboard" element={<B2BDashboard />} />
                      <Route path="/pause-dej-at-work/employees" element={<EmployeeManagement />} />
                      <Route path="/pause-dej-at-work/budgets" element={<BudgetManagement />} />
                      <Route path="/pause-dej-at-work/analytics" element={<B2BAnalytics />} />
                      <Route path="/pause-dej-at-work/invoices" element={<MonthlyInvoices />} />
                      <Route path="/pause-dej-at-work/bulk-order" element={<BulkOrderPage />} />

                      {/* Legal Routes */}
                      <Route path="/legal/mentions-legales" element={<MentionsLegalesPage />} />
                      <Route path="/legal/cgv" element={<CGVPage />} />
                      <Route path="/legal/confidentialite" element={<PrivacyPolicyPage />} />
                      <Route path="/legal/cookies" element={<CookiesPage />} />

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Box>
                  <Footer />
                </Box>
              }
            />
          </Routes>
          <PWAInstallPrompt />
          </CartDrawerProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
