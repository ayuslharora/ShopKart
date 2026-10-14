import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import PrivateRoutes from "./components/PrivateRoutes"
import PublicRoutes from "./components/PublicRoutes"


// Pages are ready — wire these up with react-router-dom (already installed).
function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoutes><Login /></PublicRoutes>} />
      <Route path="/signup" element={<PublicRoutes><Signup /></PublicRoutes>} />
      <Route path="/home" element={<PrivateRoutes><Home /></PrivateRoutes>} />
      <Route path="/profile" element={<PrivateRoutes><Profile /></PrivateRoutes>} />
      <Route path="/products" element={<PrivateRoutes><Products /></PrivateRoutes>} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/wishlist" element={<PrivateRoutes><Wishlist /></PrivateRoutes>} />
      <Route path="/cart" element={<PrivateRoutes><Cart /></PrivateRoutes>} />
      <Route path="/checkout" element={<PrivateRoutes><Checkout /></PrivateRoutes>} />
      <Route path="/order-success/:id" element={<PrivateRoutes><OrderSuccess /></PrivateRoutes>} />
      <Route path="/orders" element={<PrivateRoutes><Orders /></PrivateRoutes>} />
      <Route path="/orders/:id" element={<PrivateRoutes><OrderDetails /></PrivateRoutes>} />
    </Routes>
  </BrowserRouter>
}

export default App
