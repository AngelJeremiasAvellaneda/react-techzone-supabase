// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // CARGA INICIAL DE SESIÓN + PERFIL
  // ==================================================
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) await fetchProfile(sessionUser.id);

      setLoading(false);
    };

    load();

    // Listener global
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const current = session?.user ?? null;
        setUser(current);

        if (current) fetchProfile(current.id);
        else setProfile(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ==================================================
  // OBTENER PERFIL
  // ==================================================
  const fetchProfile = async (id) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) setProfile(data);
  };

  // ==================================================
  // LOGIN NORMAL
  // ==================================================
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      await fetchProfile(data.user.id);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==================================================
  // SIGNUP NORMAL
  // ==================================================
  const signUp = async ({ email, password, fullName }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) throw error;

      // ===============================
      // 🟦 ESPERAR A QUE LA SESIÓN EXISTA
      // ===============================
      let tries = 0;
      let newUser = null;

      while (tries < 5) {
        const { data: s } = await supabase.auth.getSession();
        if (s?.session?.user) {
          newUser = s.session.user;
          break;
        }
        tries++;
        await new Promise((r) => setTimeout(r, 300)); // 300ms
      }

      // Si nunca apareció sesión, igual damos success pero sin perfil
      if (!newUser) {
        console.warn("⚠ No hubo sesión activa después del signup.");
        return { success: true };
      }

      // ===============================
      // 🟩 INSERTAR PERFIL CORRECTAMENTE
      // ===============================
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: newUser.id,
          full_name: fullName,
          email,
          avatar_url: null,
          role: "customer",
          phone: null,
          birth_date: null,
        });

      if (insertError) {
        console.error("❌ Error insertando perfil:", insertError);
      } else {
        console.log("✅ Perfil insertado correctamente!");
      }


      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };


  // ==================================================
  // LOGIN CON GOOGLE
  // ==================================================
  const signInWithProvider = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);

      return { success: true };
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
      return { success: false, error: err.message };
    }
  };
  // ==================================================
  // ACTUALIZAR PERFIL
  // ==================================================
  const updateProfile = async (newData) => {
    try {
      if (!user?.id) return { success: false, error: "Usuario no autenticado" };

      // Construir objeto dinámicamente
      const updateData = {
        full_name: newData.full_name,
        phone: newData.phone,
        avatar_url: newData.avatar_url ?? null,
      };

      // Solo agregar birth_date si tiene valor o null si quieres borrar
      if (newData.birth_date) updateData.birth_date = newData.birth_date;
      else updateData.birth_date = null; // <-- opcional

      // Solo agregar updated_at si la columna existe en tu tabla
      // updateData.updated_at = new Date(); // Descomenta solo si existe

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error actualizando perfil:", error);
        return { success: false, error: error.message };
      }

      setProfile(data);
      return { success: true };
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      return { success: false, error: err.message };
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        updateProfile,   // 👈 AGREGADO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
