import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'

// Pages are ready — wire these up with react-router-dom (already installed).
function App() {
  return <BrowserRouter>
    <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/home" element={<Home />} />
    </Routes>
  </BrowserRouter>
}

export default App
