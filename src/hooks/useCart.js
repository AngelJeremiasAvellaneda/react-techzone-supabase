import { useState, useEffect } from "react";

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    // Aseguramos propiedad cantidad
    if (!product.cantidad || product.cantidad < 1) product.cantidad = 1;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);

      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, cantidad: i.cantidad + product.cantidad }
            : i
        );
      }

      return [...prev, product]; // Se agrega el nuevo
    });
  };

  const emptyCart = () => setCart([]);
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id, delta) =>
    setCart(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, cantidad: Math.max(1, i.cantidad + delta) }
          : i
      )
    );

  const totalItems = cart.reduce((sum, i) => sum + i.cantidad, 0);
  const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.cantidad), 0);

  return {
    cart,
    addToCart,
    emptyCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    setCart
  };
};
