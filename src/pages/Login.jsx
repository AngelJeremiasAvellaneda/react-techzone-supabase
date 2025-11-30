// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, ShoppingBag, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import BaseLayout from '../layouts/BaseLayout';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { user, signIn, signUp, signInWithProvider, loadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya hay sesión
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (!isLogin) {
      if (!formData.fullName) {
        setError('Por favor ingresa tu nombre completo');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login email/password
        const result = await signIn({ email: formData.email, password: formData.password });
        if (!result.success) {
          setError(result.error);
          return;
        }
        navigate('/');
      } else {
        // Registro manual
        const result = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        alert('¡Cuenta creada exitosamente! Por favor verifica tu email.');
        setIsLogin(true);
        setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    setError('');
    try {
      const { success, error } = await signInWithProvider(provider);
      if (!success) setError(error);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error con la autenticación social.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
  };

  // Mostrar loader si todavía se verifica la sesión
  if (loadingUser) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <BaseLayout title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 mt-16">
        <div className="max-w-md w-full space-y-8">
          {/* Logo y título */}
          <div className="text-center">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ShoppingBag className="w-10 h-10 text-[var(--accent)]" />
                <span className="text-3xl font-bold text-[var(--accent)]">TechZone</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-[var(--text)]">
              {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="mt-2 text-sm text-[var(--nav-muted)]">
              {isLogin
                ? 'Ingresa a tu cuenta para continuar'
                : 'Regístrate para disfrutar de todos nuestros beneficios'}
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-[var(--menu-bg)] rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text)] mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <Link to="/forgot-password" className="text-[var(--accent)] hover:opacity-80 font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-white bg-[var(--accent)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                )}
              </button>
            </form>

            {/* OAuth Divider solo si está disponible */}
            {isLogin && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--menu-bg)] text-[var(--nav-muted)]">
                      O inicia sesión con (próximamente)
                    </span>
                  </div>
                </div>

                {/* Botones OAuth ocultos hasta habilitar proveedores */}
                {/* 
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleOAuth('google')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <FcGoogle className="w-5 h-5" /> Google
                  </button>
                  <button
                    onClick={() => handleOAuth('facebook')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <FaFacebookF className="w-5 h-5 text-blue-600" /> Facebook
                  </button>
                </div>
                */}
              </div>
            )}

            {/* Toggle y términos */}
            <div className="mt-6">
              <button
                type="button"
                onClick={toggleMode}
                className="mt-4 w-full py-3 px-4 border-2 border-[var(--accent)] rounded-lg text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-semibold transition-all"
              >
                {isLogin ? 'Crear una cuenta' : 'Iniciar sesión'}
              </button>
              {!isLogin && (
                <p className="mt-4 text-xs text-center text-[var(--nav-muted)]">
                  Al crear una cuenta, aceptas nuestros{' '}
                  <Link to="/terms" className="text-[var(--accent)] hover:opacity-80">
                    Términos y Condiciones
                  </Link>{' '}
                  y nuestra{' '}
                  <Link to="/privacy" className="text-[var(--accent)] hover:opacity-80">
                    Política de Privacidad
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-[var(--nav-muted)] hover:text-[var(--accent)] transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Login;
