import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/index.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import News from "./pages/News.jsx";
import Laptops from "./pages/Laptops.jsx";
import Desktops from "./pages/Desktops.jsx";
import Accessories from "./pages/Accessories.jsx";
import ProductPage from "./pages/products/[id].jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Account from './pages/Account.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/News" element={<News />} />
        <Route path="/Laptops" element={<Laptops />} />
        <Route path="/Desktops" element={<Desktops />} />
        <Route path="/Accessories" element={<Accessories />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account/:tab?" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
