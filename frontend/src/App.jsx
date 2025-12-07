import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { CartProvider } from './context/CartContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/home/HomePage'
import CataloguePage from './pages/catalogue/CataloguePage'
import CartPage from './pages/cart/CartPage'
import AccountPage from './pages/account/AccountPage'

function App() {
  return (
    <Router>
      <CartProvider>
        <Box minH="100vh" display="flex" flexDirection="column">
          <Header />
          <Box flex="1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/compte" element={<AccountPage />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </CartProvider>
    </Router>
  )
}

export default App
