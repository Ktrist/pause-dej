import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import HomePage from './pages/home/HomePage'

function App() {
  return (
    <Router>
      <Box minH="100vh">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default App
