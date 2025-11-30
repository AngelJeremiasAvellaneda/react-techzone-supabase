// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useCartContext } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext";
import useTheme from "../hooks/useTheme.js";
import { 
  Sun, Moon, ShoppingCart, Menu, X, 
  User, LogIn, UserPlus, Settings, 
  Heart, Package, MapPin,
  LogOut, ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const products = [
  { name: "Laptops", href: "/Laptops", icon: "" },
  { name: "Desktops", href: "/Desktops", icon: "" },
  { name: "Accesorios", href: "/Accessories", icon: "" },
];

const Header = ({ currentPage }) => {
  const { cart, addToCart, totalItems, cartOpen, setCartOpen } = useCartContext();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

  const productBtnRef = useRef(null);
  const submenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userBtnRef = useRef(null);

  const [prevItems, setPrevItems] = useState(totalItems);
  const [animateBadge, setAnimateBadge] = useState(false);

  // Animación del badge del carrito
  useEffect(() => {
    if (totalItems !== prevItems) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      setPrevItems(totalItems);
      return () => clearTimeout(timer);
    }
  }, [totalItems, prevItems]);

  // Cierre de menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productBtnRef.current && !productBtnRef.current.contains(e.target) &&
          submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
      if (userBtnRef.current && !userBtnRef.current.contains(e.target) &&
          userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
          !e.target.closest("#hamburger-btn")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setMobileOpen(false);
    setMobileSubmenuOpen(false);
    setMobileUserMenuOpen(false);
  }, [currentPage]);

  // Función helper
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-transparent border-b border-white/10 dark:border-white/5 transition-all duration-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative z-50">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:scale-105 transform transition-transform duration-300">
            TechZone
          </Link>

          {/* Mobile */}
          <div className="flex items-center space-x-3 md:hidden">
            {user ? (
              <button 
                onClick={() => setMobileUserMenuOpen(prev => !prev)} 
                className="relative p-2 rounded-full hover:bg-[var(--low-tone)] transition group"
                aria-label="Cuenta"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'Usuario'} className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(profile?.full_name)}
                  </div>
                )}
              </button>
            ) : (
              <Link to="/login" className="p-2 rounded-full hover:bg-[var(--low-tone)] transition">
                <User className="w-6 h-6" />
              </Link>
            )}

            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-full hover:bg-[var(--low-tone)] transition">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${animateBadge ? "scale-125" : "scale-100"} transition-transform`}>{totalItems}</span>
              )}
            </button>

            <button id="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[var(--low-tone)] transition">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex space-x-8 font-medium items-center">
            <li><Link to="/" className={`nav-link ${currentPage === "/" ? "text-purple-500 font-bold" : ""}`}>Inicio</Link></li>
            <li><Link to="/About" className={`nav-link ${currentPage === "/about" ? "text-purple-500 font-bold" : ""}`}>Sobre Nosotros</Link></li>

            {/* Productos */}
            <li className="relative">
              <button ref={productBtnRef} onClick={() => setSubmenuOpen(!submenuOpen)} className={`flex items-center gap-1 nav-link ${products.some(p => p.href === currentPage) ? "text-purple-500 font-bold" : ""}`}>
                Productos
                <ChevronDown className={`w-4 h-4 transition-transform ${submenuOpen ? "rotate-180" : ""}`} />
              </button>

              <ul ref={submenuRef} className={`absolute left-0 mt-3 w-44 rounded-lg shadow-xl submenu-bg transform transition-all duration-300 ${submenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                {products.map(item => (
                  <li key={item.href}>
                    <Link to={item.href} className={`block px-4 py-2 text-sm nav-sub-link rounded-lg hover:bg-[var(--low-tone)] ${currentPage === item.href ? "text-purple-500 font-bold bg-purple-50 dark:bg-purple-900/20" : ""}`}>
                      <span className="mr-2">{item.icon}</span> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li><Link to="/News" className="nav-link">Novedades</Link></li>
            <li><Link to="/Contact" className="nav-link">Contacto</Link></li>
          </ul>

          {/* Desktop user, cart, theme */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button ref={userBtnRef} onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--low-tone)] transition">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" /> :
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">{getInitials(profile?.full_name)}</div>}
                  <span className="text-sm font-medium max-w-[100px] truncate">{(profile?.full_name || "Usuario").split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Menu Usuario */}
                <div ref={userMenuRef} className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl submenu-bg border border-white/10 transform transition-all duration-300 overflow-hidden ${userMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10">
                    <p className="text-sm font-semibold">{profile?.full_name}</p>
                    <p className="text-xs text-[var(--nav-muted)] truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/account/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                      <Settings className="w-5 h-5 text-purple-500" /> Mi Cuenta
                    </Link>
                    <Link to="/account/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--low-tone)] transition">
                      <Package className="w-5 h-5 text-blue-500" /> Mis Pedidos
                    </Link>
                    <Link to="/account/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--low-tone)] transition">
                      <Heart className="w-5 h-5 text-red-500" /> Lista de Deseos
                    </Link>
                    <Link to="/account/addresses" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--low-tone)] transition">
                      <MapPin className="w-5 h-5 text-green-500" /> Direcciones
                    </Link>
                  </div>
                  <div className="border-t border-white/10 py-2">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 w-full"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"><LogIn className="w-5 h-5" /> Iniciar Sesión</Link>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-90 transition"><UserPlus className="w-5 h-5" /> Registrarse</Link>
              </div>
            )}

            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-full hover:bg-[var(--low-tone)] transition">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${animateBadge ? "scale-125" : "scale-100"} transition-transform`}>{totalItems}</span>
              )}
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--low-tone)] transition">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div ref={mobileMenuRef} className={`fixed top-16 right-0 w-full h-[calc(100vh-4rem)] bg-[var(--menu-bg)] backdrop-blur-2xl z-40 transition-transform duration-300 ${mobileOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
          <div className="p-6 flex flex-col space-y-4 overflow-y-auto">

            {/* Usuario móvil */}
            {user && (
              <div>
                <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[var(--low-tone)] transition" onClick={() => setMobileUserMenuOpen(prev => !prev)}>
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" /> :
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-bold flex items-center justify-center">{getInitials(profile?.full_name)}</div>}
                    <span>{profile?.full_name || "Usuario"}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${mobileUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileUserMenuOpen && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2">
                    <Link to="/account/profile" className="mobile-sublink flex items-center gap-2" onClick={() => setMobileOpen(false)}><Settings className="w-5 h-5 text-purple-500" /> Mi Cuenta</Link>
                    <Link to="/account/orders" className="mobile-sublink flex items-center gap-2" onClick={() => setMobileOpen(false)}><Package className="w-5 h-5 text-blue-500" /> Mis Pedidos</Link>
                    <Link to="/account/wishlist" className="mobile-sublink flex items-center gap-2" onClick={() => setMobileOpen(false)}><Heart className="w-5 h-5 text-red-500" /> Lista de Deseos</Link>
                    <Link to="/account/addresses" className="mobile-sublink flex items-center gap-2" onClick={() => setMobileOpen(false)}><MapPin className="w-5 h-5 text-green-500" /> Direcciones</Link>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 px-4 py-2 rounded hover:bg-red-500/10"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
                  </div>
                )}
              </div>
            )}

            {/* Enlaces principales */}
            <Link to="/" className="mobile-link">Inicio</Link>
            <Link to="/About" className="mobile-link">Sobre Nosotros</Link>

            {/* Productos con submenú */}
            <div className="flex flex-col">
              <button className="mobile-link flex justify-between" onClick={() => setMobileSubmenuOpen(prev => !prev)}>
                Productos
                <ChevronDown className={`${mobileSubmenuOpen ? "rotate-180" : ""} transition`} />
              </button>

              {mobileSubmenuOpen && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  {products.map(p => (
                    <Link key={p.href} to={p.href} className="mobile-sublink flex items-center gap-2" onClick={() => { setMobileOpen(false); setMobileSubmenuOpen(false); }}>
                      <span>{p.icon}</span> {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/News" className="mobile-link">Novedades</Link>
            <Link to="/Contact" className="mobile-link">Contacto</Link>

            {/* Tema */}
            <button onClick={toggleTheme} className="mobile-link flex items-center justify-center w-12 h-12 rounded-full hover:bg-[var(--accent)]/20 transition">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </>
  );
};

export default Header;
