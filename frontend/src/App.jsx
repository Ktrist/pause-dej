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

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
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
              </Routes>
            </Box>
            <Footer />
          </Box>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
