"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Payment {
  id: number;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  voucherImage?: string;
  voucherNotes?: string;
  paidAt?: string;
}

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  onSuccess: () => void;
}

export function PaymentVoucherModal({ isOpen, onClose, payment, onSuccess }: PaymentVoucherModalProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    voucherImage: payment.voucherImage || '',
    voucherNotes: payment.voucherNotes || '',
    paymentMethod: payment.paymentMethod || 'transfer',
    transactionId: payment.transactionId || '',
    status: payment.status
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      setError(null);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      
      const res = await fetch('/api/payments/${payment.id}', {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Error updating payment');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold">Registrar Pago</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Información del Pago</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Monto</p>
                <p className="text-lg font-bold text-gray-900">${payment.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado Actual</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  payment.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.status === 'PAID' ? 'Pagado' : payment.status === 'UNPAID' ? 'Pendiente' : 'Reembolsado'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="transfer">Transferencia Bancaria</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div className="mb-4">
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de Transacción / Referencia
            </label>
            <input
              type="text"
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => handleInputChange('transactionId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: OP123456789"
            />
          </div>

          {/* Voucher Image URL */}
          <div className="mb-4">
            <label htmlFor="voucherImage" className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen del Voucher
            </label>
            <input
              type="url"
              id="voucherImage"
              value={formData.voucherImage}
              onChange={(e) => handleInputChange('voucherImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com/voucher.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes subir la imagen a un servicio como Imgur, Cloudinary, o usar un enlace directo
            </p>
            
            {/* Preview */}
            {formData.voucherImage && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                <div className="relative w-full overflow-hidden rounded-lg border border-gray-300">
                  <Image
                    src={formData.voucherImage}
                    alt="Voucher preview"
                    width={600}
                    height={400}
                    className="h-auto w-full object-contain"
                    onError={() => setFormData(prev => ({ ...prev, voucherImage: '' }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Voucher Notes */}
          <div className="mb-4">
            <label htmlFor="voucherNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              id="voucherNotes"
              rows={3}
              value={formData.voucherNotes}
              onChange={(e) => handleInputChange('voucherNotes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional sobre el pago..."
            />
          </div>

          {/* Payment Status */}
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Pago *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="UNPAID">Pendiente</option>
              <option value="PAID">Pagado</option>
              <option value="REFUNDED">Reembolsado</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
            >
              {uploading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {uploading ? 'Guardando...' : 'Guardar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
