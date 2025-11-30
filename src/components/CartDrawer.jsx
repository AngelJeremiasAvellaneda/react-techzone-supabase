// src/components/CartDrawer.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartContext } from "../context/CartContext.jsx";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

const CartDrawer = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    emptyCart,
    totalItems,
    totalPrice,
    cartOpen,
    setCartOpen
  } = useCartContext();

  const drawerRef = useRef(null);

  // Manejar inert y focus cuando el drawer se abre/cierra
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    if (cartOpen) {
      drawer.removeAttribute("inert");
      document.body.style.overflow = 'hidden';
      
      const firstFocusable = drawer.querySelector("button, [href], input");
      firstFocusable?.focus();
    } else {
      drawer.setAttribute("inert", "true");
      document.body.style.overflow = '';
      
      const active = document.activeElement;
      if (active && drawer.contains(active)) active.blur();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && cartOpen) {
        setCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [cartOpen, setCartOpen]);

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 right-0 h-full bg-[var(--menu-bg)] backdrop-blur-xl shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${cartOpen ? "translate-x-0" : "translate-x-full"}
          w-full sm:w-96 md:w-[28rem]
          flex flex-col
          border-l border-gray-200 dark:border-gray-800
        `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="font-bold text-[var(--text)] text-xl">
              Carrito ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5 text-[var(--text)]" />
          </button>
        </div>

        {/* LISTA (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-[var(--nav-muted)] text-lg mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-[var(--nav-muted)] mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <Link
                to="/"
                onClick={() => setCartOpen(false)}
                className="px-6 py-3 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg transition-all font-medium"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-[var(--menu-bg)] rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                {/* Imagen */}
                <Link
                  to={`/products/${item.id}`}
                  onClick={() => setCartOpen(false)}
                  className="flex-shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-lg bg-[var(--menu-bg)]"
                  />
                </Link>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.id}`}
                    onClick={() => setCartOpen(false)}
                    className="font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-2 mb-1"
                  >
                    {item.name}
                  </Link>

                  <p className="text-lg font-bold text-[var(--accent)] mb-3">
                    S/. {Number(item.price).toLocaleString("es-PE")}
                  </p>

                  {/* Controles */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-l-lg"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4 text-[var(--text)]" />
                      </button>

                      <span className="px-3 font-semibold text-[var(--text)] min-w-[2rem] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-r-lg"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4 text-[var(--text)]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER FIJO */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-[var(--menu-bg)] space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-[var(--text)]">Subtotal:</span>
              <span className="font-bold text-[var(--accent)] text-2xl">
                S/. {Number(totalPrice).toLocaleString("es-PE")}
              </span>
            </div>

            {/* Botón Ver Carrito */}
            <Link
              to="/cart"
              onClick={() => setCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
            >
              Ver carrito completo
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Botón Vaciar */}
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                  emptyCart();
                }
              }}
              className="w-full bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-2 rounded-lg font-medium transition-all"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;