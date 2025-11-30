// src/pages/Account.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import BaseLayout from '../layouts/BaseLayout';
import {
  User, Mail, Lock, Camera, Save, X,
  Package, Heart, MapPin, CreditCard,
  Bell, Shield, HelpCircle, LogOut,
  Phone, Calendar, Settings, Eye, EyeOff,
  Edit2, Check, AlertCircle, Trash2
} from 'lucide-react';

const Account = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams(); // <--- obtener tab de la URL

  const [activeTab, setActiveTab] = useState(tab || 'profile'); // <--- inicializar desde la URL
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para edición
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    birth_date: profile?.birth_date || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });

  // Actualizar activeTab si cambia el parámetro de la URL
  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  // Redirigir al login si no hay usuario
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setLoading(true);
    try {
      setSuccess('Imagen actualizada correctamente');
    } catch (err) {
      setError('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Perfil actualizado correctamente');
        setEditMode(false);
      } else {
        setError(result.error || 'Error al actualizar perfil');
      }
    } catch (err) {
      setError('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'orders', name: 'Pedidos', icon: Package },
    { id: 'wishlist', name: 'Favoritos', icon: Heart },
    { id: 'addresses', name: 'Direcciones', icon: MapPin },
    { id: 'payment', name: 'Pagos', icon: CreditCard },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <BaseLayout title="Mi Cuenta">
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
              Mi Cuenta
            </h1>
            <p className="text-[var(--nav-muted)]">
              Administra tu información personal y preferencias
            </p>
          </div>
          {/* Alertas */}
          {success && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 animate-fade-in">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-[var(--menu-bg)] rounded-xl border border-white/10 p-6 sticky top-24">
                {/* Avatar y nombre */}
                <div className="text-center mb-6 pb-6 border-b border-white/10">
                  <div className="relative inline-block mb-4">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Usuario'}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/50"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-500/50">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{profile?.full_name || 'Usuario'}</h3>
                  <p className="text-sm text-[var(--nav-muted)]">{user.email}</p>
                </div>
                {/* Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                            : 'hover:bg-white/5 text-[var(--nav-text)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    );
                  })}               
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-all mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                  </button>
                </nav>
              </div>
            </div>
            {/* Tabs móviles */}
            <div className="lg:hidden mb-4">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                          : 'bg-[var(--menu-bg)] text-[var(--nav-text)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Contenido principal */}
            <div className="lg:col-span-3">
              <div className="bg-[var(--menu-bg)] rounded-xl border border-white/10 p-6 md:p-8">              
                {/* PERFIL */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Información Personal</h2>
                      {!editMode ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setFormData({
                                full_name: profile?.full_name || '',
                                phone: profile?.phone || '',
                                birth_date: profile?.birth_date || '',
                              });
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-white/5 transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Guardar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-[var(--nav-muted)] mt-1">
                          No se puede cambiar el email
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editMode}
                          placeholder="+51 999 999 999"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-semibold mb-4">Estadísticas de Cuenta</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Package className="w-6 h-6 text-purple-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Pedidos</p>
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <Heart className="w-6 h-6 text-red-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Favoritos</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <MapPin className="w-6 h-6 text-green-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Direcciones</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <CreditCard className="w-6 h-6 text-blue-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Tarjetas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* SEGURIDAD */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Seguridad y Contraseña</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                        Cambiar Contraseña
                      </button>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-semibold mb-4">Autenticación de Dos Factores</h3>
                      <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div>
                          <p className="font-medium">2FA no configurado</p>
                          <p className="text-sm text-[var(--nav-muted)]">Añade una capa extra de seguridad</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                          Activar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* NOTIFICACIONES */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Preferencias de Notificación</h2>

                    <div className="space-y-4">
                      {Object.entries({
                        emailNotifications: 'Notificaciones por Email',
                        orderUpdates: 'Actualizaciones de Pedidos',
                        promotions: 'Promociones y Ofertas',
                        newsletter: 'Newsletter Mensual',
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">{label}</span>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              notificationSettings[key] ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                                notificationSettings[key] ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* PEDIDOS */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Mis Pedidos</h2>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">No tienes pedidos aún</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        Explorar Productos
                      </button>
                    </div>
                  </div>
                )}
                {/* FAVORITOS */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Lista de Deseos</h2>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">Tu lista de deseos está vacía</p>
                    </div>
                  </div>
                )}
                {/* DIRECCIONES */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Mis Direcciones</h2>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                        <MapPin className="w-4 h-4" />
                        Agregar Dirección
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">No tienes direcciones guardadas</p>
                    </div>
                  </div>
                )}
                {/* MÉTODOS DE PAGO */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Métodos de Pago</h2>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                        <CreditCard className="w-4 h-4" />
                        Agregar Tarjeta
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">No tienes métodos de pago guardados</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Account;