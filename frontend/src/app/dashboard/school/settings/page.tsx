'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Calendar, 
  Globe,
  Smartphone,
  Mail,
  Clock,
  MapPin,
  Save,
  ArrowLeft,
  Sliders,
  Database,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface SchoolSettings {
  // General Settings
  autoConfirmReservations: boolean;
  requirePaymentUpfront: boolean;
  allowCancellations: boolean;
  cancellationDeadlineHours: number;
  maxStudentsPerClass: number;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  notifyNewReservations: boolean;
  notifyPayments: boolean;
  notifyCancellations: boolean;
  
  // Business Settings
  businessHours: {
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
  };
  
  // Payment Settings
  acceptedPaymentMethods: string[];
  currency: string;
  taxRate: number;
  
  // Advanced Settings
  apiAccess: boolean;
  dataExport: boolean;
  customDomain: string;
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export default function SchoolSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [settings, setSettings] = useState<SchoolSettings>({
    // General Settings
    autoConfirmReservations: true,
    requirePaymentUpfront: false,
    allowCancellations: true,
    cancellationDeadlineHours: 24,
    maxStudentsPerClass: 12,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    notifyNewReservations: true,
    notifyPayments: true,
    notifyCancellations: true,
    
    // Business Settings
    businessHours: {
      monday: { open: '08:00', close: '18:00', enabled: true },
      tuesday: { open: '08:00', close: '18:00', enabled: true },
      wednesday: { open: '08:00', close: '18:00', enabled: true },
      thursday: { open: '08:00', close: '18:00', enabled: true },
      friday: { open: '08:00', close: '18:00', enabled: true },
      saturday: { open: '09:00', close: '17:00', enabled: true },
      sunday: { open: '09:00', close: '17:00', enabled: false },
    },
    
    // Payment Settings
    acceptedPaymentMethods: ['card', 'cash', 'transfer'],
    currency: 'PEN',
    taxRate: 18,
    
    // Advanced Settings
    apiAccess: false,
    dataExport: true,
    customDomain: '',
    seoSettings: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });
  
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'business' | 'payments' | 'advanced'>('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }
  }, [session, status, router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof SchoolSettings] as any),
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between py-3 gap-3">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 leading-tight">{label}</h4>
        {description && <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-tight">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'business', label: 'Horarios', icon: Clock },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'advanced', label: 'Avanzado', icon: Sliders },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/school"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración de Escuela</h1>
                <p className="text-gray-600 mt-1">Personaliza la configuración de tu escuela de surf</p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                saved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : saved ? (
                <Shield className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saved ? 'Guardado' : loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation - Mobile Optimized */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
              {/* Mobile Tab Selector */}
              <div className="lg:hidden mb-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {tabs.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="space-y-1 sm:space-y-2 hidden lg:block">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content - Mobile Optimized */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
              
              {/* General Settings - Mobile Optimized */}
              {activeTab === 'general' && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Configuración General</h2>
                    <p className="text-sm sm:text-base text-gray-600">Configura el comportamiento básico de tu escuela</p>
                  </div>

                  <div className="space-y-6">
                    <ToggleSwitch
                      enabled={settings.autoConfirmReservations}
                      onChange={(value) => updateSetting('autoConfirmReservations', value)}
                      label="Confirmar reservas automáticamente"
                      description="Las reservas se confirman sin intervención manual"
                    />

                    <ToggleSwitch
                      enabled={settings.requirePaymentUpfront}
                      onChange={(value) => updateSetting('requirePaymentUpfront', value)}
                      label="Requerir pago por adelantado"
                      description="Los estudiantes deben pagar antes de confirmar la reserva"
                    />

                    <ToggleSwitch
                      enabled={settings.allowCancellations}
                      onChange={(value) => updateSetting('allowCancellations', value)}
                      label="Permitir cancelaciones"
                      description="Los estudiantes pueden cancelar sus reservas"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plazo de cancelación (horas)
                        </label>
                        <input
                          type="number"
                          value={settings.cancellationDeadlineHours}
                          onChange={(e) => updateSetting('cancellationDeadlineHours', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          max="168"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Máximo estudiantes por clase
                        </label>
                        <input
                          type="number"
                          value={settings.maxStudentsPerClass}
                          onChange={(e) => updateSetting('maxStudentsPerClass', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Notificaciones</h2>
                    <p className="text-gray-600">Configura cómo y cuándo recibir notificaciones</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Canales de Notificación</h3>
                      
                      <ToggleSwitch
                        enabled={settings.emailNotifications}
                        onChange={(value) => updateSetting('emailNotifications', value)}
                        label="Notificaciones por Email"
                        description="Recibir notificaciones en tu correo electrónico"
                      />

                      <ToggleSwitch
                        enabled={settings.smsNotifications}
                        onChange={(value) => updateSetting('smsNotifications', value)}
                        label="Notificaciones por SMS"
                        description="Recibir notificaciones por mensaje de texto"
                      />

                      <ToggleSwitch
                        enabled={settings.whatsappNotifications}
                        onChange={(value) => updateSetting('whatsappNotifications', value)}
                        label="Notificaciones por WhatsApp"
                        description="Recibir notificaciones por WhatsApp"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Notificación</h3>
                      
                      <ToggleSwitch
                        enabled={settings.notifyNewReservations}
                        onChange={(value) => updateSetting('notifyNewReservations', value)}
                        label="Nuevas Reservas"
                        description="Notificar cuando se haga una nueva reserva"
                      />

                      <ToggleSwitch
                        enabled={settings.notifyPayments}
                        onChange={(value) => updateSetting('notifyPayments', value)}
                        label="Pagos Recibidos"
                        description="Notificar cuando se reciba un pago"
                      />

                      <ToggleSwitch
                        enabled={settings.notifyCancellations}
                        onChange={(value) => updateSetting('notifyCancellations', value)}
                        label="Cancelaciones"
                        description="Notificar cuando se cancele una reserva"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {activeTab === 'business' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Horarios de Atención</h2>
                    <p className="text-gray-600">Define los horarios de operación de tu escuela</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(settings.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {day === 'monday' ? 'Lunes' :
                             day === 'tuesday' ? 'Martes' :
                             day === 'wednesday' ? 'Miércoles' :
                             day === 'thursday' ? 'Jueves' :
                             day === 'friday' ? 'Viernes' :
                             day === 'saturday' ? 'Sábado' : 'Domingo'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hours.enabled}
                            onChange={(e) => updateNestedSetting('businessHours', day, {
                              ...hours,
                              enabled: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">Abierto</span>
                        </div>

                        {hours.enabled && (
                          <>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">De:</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => updateNestedSetting('businessHours', day, {
                                  ...hours,
                                  open: e.target.value
                                })}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">A:</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => updateNestedSetting('businessHours', day, {
                                  ...hours,
                                  close: e.target.value
                                })}
                                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payments' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Pagos</h2>
                    <p className="text-gray-600">Configura los métodos de pago y opciones financieras</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago Aceptados</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'card', label: 'Tarjeta de Crédito/Débito', icon: CreditCard },
                          { id: 'cash', label: 'Efectivo', icon: Users },
                          { id: 'transfer', label: 'Transferencia Bancaria', icon: Database },
                        ].map(({ id, label, icon: Icon }) => (
                          <div key={id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.acceptedPaymentMethods.includes(id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateSetting('acceptedPaymentMethods', [...settings.acceptedPaymentMethods, id]);
                                } else {
                                  updateSetting('acceptedPaymentMethods', settings.acceptedPaymentMethods.filter(m => m !== id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moneda
                        </label>
                        <select
                          value={settings.currency}
                          onChange={(e) => updateSetting('currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PEN">Soles Peruanos (PEN)</option>
                          <option value="USD">Dólares Americanos (USD)</option>
                          <option value="EUR">Euros (EUR)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tasa de Impuesto (%)
                        </label>
                        <input
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {activeTab === 'advanced' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración Avanzada</h2>
                    <p className="text-gray-600">Opciones avanzadas para usuarios experimentados</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">API y Integraciones</h3>
                      
                      <ToggleSwitch
                        enabled={settings.apiAccess}
                        onChange={(value) => updateSetting('apiAccess', value)}
                        label="Acceso a API"
                        description="Permitir acceso a la API para integraciones externas"
                      />

                      {settings.apiAccess && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Clave API</h4>
                              <p className="text-sm text-gray-500">Usa esta clave para autenticar las llamadas a la API</p>
                            </div>
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="mt-2">
                            <code className="block p-2 bg-white border rounded text-sm font-mono">
                              {showApiKey ? 'sk_live_1234567890abcdef' : '••••••••••••••••••••'}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos y Exportación</h3>
                      
                      <ToggleSwitch
                        enabled={settings.dataExport}
                        onChange={(value) => updateSetting('dataExport', value)}
                        label="Exportación de Datos"
                        description="Permitir exportar datos de la escuela en formato CSV/Excel"
                      />
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dominio Personalizado</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dominio Personalizado
                        </label>
                        <input
                          type="text"
                          value={settings.customDomain}
                          onChange={(e) => updateSetting('customDomain', e.target.value)}
                          placeholder="miescuela.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Configura un dominio personalizado para tu escuela
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título Meta
                          </label>
                          <input
                            type="text"
                            value={settings.seoSettings.metaTitle}
                            onChange={(e) => updateNestedSetting('seoSettings', 'metaTitle', e.target.value)}
                            placeholder="Escuela de Surf - Clases profesionales"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción Meta
                          </label>
                          <textarea
                            value={settings.seoSettings.metaDescription}
                            onChange={(e) => updateNestedSetting('seoSettings', 'metaDescription', e.target.value)}
                            placeholder="Aprende surf con instructores profesionales..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Palabras Clave
                          </label>
                          <input
                            type="text"
                            value={settings.seoSettings.keywords}
                            onChange={(e) => updateNestedSetting('seoSettings', 'keywords', e.target.value)}
                            placeholder="surf, clases, escuela, lima, peru"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}