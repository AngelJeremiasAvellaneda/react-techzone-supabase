// src/hooks/useReviews.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook para manejar reseñas y estado de usuario
 * @param {number} productId - ID del producto
 */
export function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState(null); 
  const [canReview, setCanReview] = useState(false);

  const loadReviews = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const safeReviews = reviewsData || [];

      // Obtener todos los usuarios de las reseñas
      const userIds = [...new Set(safeReviews.map(r => r.user_id).filter(Boolean))];
      let usersMap = {};

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        usersMap = usersData?.reduce((acc, u) => {
          acc[u.id] = u.full_name;
          return acc;
        }, {}) || {};
      }

      const mappedData = safeReviews.map(review => ({
        ...review,
        user: { full_name: usersMap[review.user_id] || "Usuario" }
      }));

      setReviews(mappedData);
      setTotalReviews(mappedData.length);

      if (mappedData.length > 0) {
        const sum = mappedData.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating(sum / mappedData.length);
      } else {
        setAverageRating(0);
      }

      // Revisar si el usuario actual ya dejó reseña
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existing = mappedData.find(r => r.user_id === user.id);
        setUserReview(existing || null);
        setCanReview(!existing);
      } else {
        setUserReview(null);
        setCanReview(false);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError(err.message || "Error cargando reseñas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const addReview = async ({ rating, comment }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para dejar una reseña");

      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([{ user_id: user.id, product_id: productId, rating, comment }])
        .select();

      if (insertError) throw insertError;

      await loadReviews();
      return { success: true, data };
    } catch (err) {
      console.error("Error adding review:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      await loadReviews();
      return { success: true };
    } catch (err) {
      console.error("Error deleting review:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    reviews,
    loading,
    error,
    averageRating,
    totalReviews,
    addReview,
    deleteReview,
    userReview,
    canReview,
    refetch: loadReviews
  };
}
