import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx"; 

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sincronizar carrito con DB al iniciar sesión
  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;

      const { data: dbCart = [], error } = await supabase
        .from("cart_items")
        .select(`
          product_id,
          quantity,
          products (
            name,
            price,
            image
          )
        `)
        .eq("user_id", user.id);

      if (error) return console.error(error);

      const mappedDbCart = dbCart.map(item => ({
        id: item.product_id,
        quantity: item.quantity,
        name: item.products.name,
        price: Number(item.products.price),
        image: item.products.image
      }));

      setCart(mappedDbCart);

      // Subir todos los items a la DB de una sola vez con onConflict
      if (mappedDbCart.length > 0) {
        await supabase.from("cart_items").upsert(
          mappedDbCart.map(item => ({
            user_id: user.id,
            product_id: String(item.id),
            quantity: item.quantity
          })),
          { onConflict: ['user_id', 'product_id'] }
        );
      }

      localStorage.removeItem("cart");
    };
    syncCart();
  }, [user]);

  const addToCart = async (product) => {
    if (!product.quantity || product.quantity < 1) product.quantity = 1;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + product.quantity } : i
        );
      }
      return [...prev, product];
    });

    setCartOpen(true);

    if (user) {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", Number(product.id))
        .maybeSingle(); // <- antes .single()

      const nuevaCantidad = (existing?.quantity || 0) + product.quantity;

      await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          product_id: Number(product.id),
          quantity: nuevaCantidad
        },
        { onConflict: ['user_id', 'product_id'] }
      );
    }

  };

  const updateQuantity = async (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      );

      if (user) {
        const item = updated.find(p => p.id === id);
        supabase.from("cart_items")
          .update({ quantity: item.quantity })
          .eq("user_id", user.id)
          .eq("product_id", String(id));
      }

      return updated;
    });
  };

  const removeItem = async (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    if (user) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", String(id));
    }
  };

  const emptyCart = async () => {
    setCart([]);
    if (user) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", user.id);
    }
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    emptyCart,
    totalItems,
    totalPrice,
    setCart,
    cartOpen,
    setCartOpen
  };
};
