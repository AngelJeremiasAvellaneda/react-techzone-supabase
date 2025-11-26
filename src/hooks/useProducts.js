import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const useProducts = (categoryNames) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      // Si categoryNames es string, convertir a array
      const categories = Array.isArray(categoryNames) ? categoryNames : [categoryNames];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          stock,
          image,
          specs,
          categories!inner(name)
        `)
        .in("categories.name", categories); // 🔹 Usar .in para múltiples categorías

      if (error) {
        console.error("Error cargando productos:", error.message);
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    if (categoryNames && categoryNames.length > 0) loadProducts();
  }, [categoryNames]);

  return { products, loading };
};
