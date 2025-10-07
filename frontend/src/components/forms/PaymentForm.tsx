'use client';

import { useState, useEffect } from 'react';
import { Payment, Reservation, PaymentMethod, PaymentProvider } from '@/types';
import { useApiCall } from '@/hooks/useApiCall';
import { CreditCard, Smartphone, Building, QrCode, DollarSign, Upload } from 'lucide-react';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: Partial<Payment>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PaymentForm({ payment, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    reservationId: payment?.reservationId || '',
    amount: payment?.amount || 0,
    status: payment?.status || 'UNPAID',
    paymentMethod: payment?.paymentMethod || 'CREDIT_CARD',
    paymentProvider: payment?.paymentProvider || 'STRIPE',
    transactionId: payment?.transactionId || '',
    externalTransactionId: payment?.externalTransactionId || '',
    voucherNotes: payment?.voucherNotes || '',
    bankAccount: payment?.bankAccount || '',
    referenceNumber: payment?.referenceNumber || '',
    paymentInstructions: payment?.paymentInstructions || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const { makeRequest } = useApiCall();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const result = await makeRequest('/api/reservations', { method: 'GET' });
      if (result.data) {
        // Filtrar reservaciones que no tienen pago o tienen pago pendiente
        const unpaidReservations = result.data.filter((r: Reservation) => 
          !r.payment || r.payment.status === 'UNPAID'
        );
        setReservations(unpaidReservations);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string; icon: any; providers: PaymentProvider[] }[] = [
    {
      value: 'CREDIT_CARD',
      label: 'Tarjeta de Crédito',
      icon: CreditCard,
      providers: ['STRIPE', 'PAYPAL', 'CULQI', 'IZIPAY', 'NIUBIZ', 'PAYU']
    },
    {
      value: 'DEBIT_CARD',
      label: 'Tarjeta de Débito',
      icon: CreditCard,
      providers: ['STRIPE', 'CULQI', 'IZIPAY', 'NIUBIZ']
    },
    {
      value: 'YAPE',
      label: 'Yape',
      icon: Smartphone,
      providers: ['YAPE']
    },
    {
      value: 'PLIN',
      label: 'Plin',
      icon: Smartphone,
      providers: ['PLIN']
    },
    {
      value: 'QR_CODE',
      label: 'Código QR',
      icon: QrCode,
      providers: ['YAPE', 'PLIN', 'IZIPAY']
    },
    {
      value: 'BANK_TRANSFER',
      label: 'Transferencia Bancaria',
      icon: Building,
      providers: ['BANK_TRANSFER']
    },
    {
      value: 'PAYPAL',
      label: 'PayPal',
      icon: DollarSign,
      providers: ['PAYPAL']
    },
    {
      value: 'MERCADOPAGO',
      label: 'MercadoPago',
      icon: DollarSign,
      providers: ['MERCADOPAGO']
    },
    {
      value: 'CASH',
      label: 'Efectivo',
      icon: DollarSign,
      providers: ['MANUAL']
    }
  ];

  const paymentProviders: { value: PaymentProvider; label: string; description: string }[] = [
    { value: 'STRIPE', label: 'Stripe', description: 'Procesador internacional de pagos' },
    { value: 'PAYPAL', label: 'PayPal', description: 'Plataforma global de pagos' },
    { value: 'MERCADOPAGO', label: 'MercadoPago', description: 'Procesador de pagos de América Latina' },
    { value: 'PAYU', label: 'PayU', description: 'Procesador de pagos para Latinoamérica' },
    { value: 'CULQI', label: 'Culqi', description: 'Procesador de pagos peruano' },
    { value: 'IZIPAY', label: 'Izipay', description: 'Procesador de pagos peruano' },
    { value: 'NIUBIZ', label: 'Niubiz', description: 'Procesador de pagos del BCP' },
    { value: 'YAPE', label: 'Yape', description: 'Billetera digital del BCP' },
    { value: 'PLIN', label: 'Plin', description: 'Billetera digital interbancaria' },
    { value: 'BANK_TRANSFER', label: 'Transferencia', description: 'Transferencia bancaria directa' },
    { value: 'MANUAL', label: 'Manual', description: 'Procesamiento manual' }
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.reservationId) newErrors.reservationId = 'La reservación es requerida';
    if (formData.amount <= 0) newErrors.amount = 'El monto debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const submitData: any = {
      reservationId: Number(formData.reservationId),
      amount: Number(formData.amount),
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      paymentProvider: formData.paymentProvider,
      transactionId: formData.transactionId || undefined,
      externalTransactionId: formData.externalTransactionId || undefined,
      voucherNotes: formData.voucherNotes || undefined,
      bankAccount: formData.bankAccount || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      paymentInstructions: formData.paymentInstructions || undefined
    };

    // TODO: Handle file upload for voucher
    if (voucherFile) {
      // Implement file upload logic
      console.log('Voucher file to upload:', voucherFile);
    }

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, voucherFile: 'El archivo no puede ser mayor a 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, voucherFile: 'Solo se permiten archivos de imagen' }));
        return;
      }
      setVoucherFile(file);
      setErrors(prev => ({ ...prev, voucherFile: '' }));
    }
  };

  const selectedMethod = paymentMethods.find(m => m.value === formData.paymentMethod);
  const availableProviders = selectedMethod?.providers || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Reservación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reservación *
        </label>
        <select
          name="reservationId"
          value={formData.reservationId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.reservationId ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading || !!payment}
        >
          <option value="">Seleccionar reservación</option>
          {reservations.map((reservation) => (
            <option key={reservation.id} value={reservation.id}>
              {reservation.user?.name} - {reservation.class?.title} - ${reservation.class?.price}
            </option>
          ))}
        </select>
        {errors.reservationId && <p className="text-red-500 text-sm mt-1">{errors.reservationId}</p>}
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto ($) *
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="UNPAID">Sin Pagar</option>
          <option value="PAID">Pagado</option>
          <option value="REFUNDED">Reembolsado</option>
        </select>
      </div>

      {/* Método de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isLoading}
                />
                <Icon className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Proveedor de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proveedor de Pago *
        </label>
        <select
          name="paymentProvider"
          value={formData.paymentProvider}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {paymentProviders
            .filter(provider => availableProviders.includes(provider.value))
            .map((provider) => (
              <option key={provider.value} value={provider.value}>
                {provider.label} - {provider.description}
              </option>
            ))}
        </select>
      </div>

      {/* Campos específicos según el método */}
      {(formData.paymentMethod === 'BANK_TRANSFER') && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Información de Transferencia</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuenta Bancaria
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              placeholder="Número de cuenta o CCI"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Referencia
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="Número de operación"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* ID de Transacción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID de Transacción Interna
        </label>
        <input
          type="text"
          name="transactionId"
          value={formData.transactionId}
          onChange={handleChange}
          placeholder="ID generado por el sistema"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* ID de Transacción Externa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID de Transacción Externa
        </label>
        <input
          type="text"
          name="externalTransactionId"
          value={formData.externalTransactionId}
          onChange={handleChange}
          placeholder="ID del proveedor de pagos"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Comprobante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comprobante de Pago
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Subir Comprobante</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {voucherFile && (
            <span className="text-sm text-green-600">
              ✓ {voucherFile.name}
            </span>
          )}
        </div>
        {errors.voucherFile && <p className="text-red-500 text-sm mt-1">{errors.voucherFile}</p>}
      </div>

      {/* Notas del Comprobante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas del Comprobante
        </label>
        <textarea
          name="voucherNotes"
          value={formData.voucherNotes}
          onChange={handleChange}
          rows={3}
          placeholder="Notas adicionales sobre el pago..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Instrucciones de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrucciones de Pago
        </label>
        <textarea
          name="paymentInstructions"
          value={formData.paymentInstructions}
          onChange={handleChange}
          rows={3}
          placeholder="Instrucciones específicas para este pago..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : payment ? 'Actualizar Pago' : 'Crear Pago'}
        </button>
      </div>
    </form>
  );
}