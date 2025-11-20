'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Link as LinkIcon, 
  DollarSign,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PaymentUploadProps {
  reservationId: number;
  amount: number;
  onPaymentSubmitted: () => void;
  existingPayment?: {
    id: number;
    paymentMethod: string;
    status: string;
    voucherImage?: string;
    voucherNotes?: string;
  };
}

type PaymentMethod = 'transfer' | 'deposit' | 'yape' | 'payment_link' | 'cash';

interface PaymentInstructions {
  transfer: {
    title: 'Transferencia Bancaria';
    icon: React.ComponentType<any>;
    instructions: string[];
    accountInfo?: {
      bank: string;
      accountType: string;
      accountNumber: string;
      accountName: string;
    };
  };
  deposit: {
    title: 'Depósito Bancario';
    icon: React.ComponentType<any>;
    instructions: string[];
    accountInfo?: {
      bank: string;
      accountType: string;
      accountNumber: string;
      accountName: string;
    };
  };
  yape: {
    title: 'Yape';
    icon: React.ComponentType<any>;
    instructions: string[];
    phoneNumber?: string;
  };
  payment_link: {
    title: 'Link de Pago';
    icon: React.ComponentType<any>;
    instructions: string[];
    link?: string;
  };
  cash: {
    title: 'Efectivo';
    icon: React.ComponentType<any>;
    instructions: string[];
  };
}

const paymentInstructions: PaymentInstructions = {
  transfer: {
    title: 'Transferencia Bancaria',
    icon: Building2,
    instructions: [
      'Realiza una transferencia bancaria por el monto exacto',
      'Toma una captura de pantalla o foto del comprobante',
      'Sube el comprobante en el formulario',
      'El pago será verificado en un plazo de 24 horas'
    ],
    accountInfo: {
      bank: 'Banco de la Nación',
      accountType: 'Cuenta Corriente',
      accountNumber: '1234567890',
      accountName: 'Lima Surf Academy'
    }
  },
  deposit: {
    title: 'Depósito Bancario',
    icon: Building2,
    instructions: [
      'Realiza un depósito en cualquier agencia del banco',
      'Conserva el voucher de depósito',
      'Toma una foto del voucher',
      'Sube el voucher en el formulario',
      'El pago será verificado en un plazo de 24 horas'
    ],
    accountInfo: {
      bank: 'Banco de la Nación',
      accountType: 'Cuenta Corriente',
      accountNumber: '1234567890',
      accountName: 'Lima Surf Academy'
    }
  },
  yape: {
    title: 'Yape',
    icon: Smartphone,
    instructions: [
      'Realiza el pago por Yape al número: 987654321',
      'Toma una captura de pantalla del comprobante',
      'Sube la captura en el formulario',
      'El pago será verificado en un plazo de 2 horas'
    ],
    phoneNumber: '987654321'
  },
  payment_link: {
    title: 'Link de Pago',
    icon: LinkIcon,
    instructions: [
      'Haz clic en el link de pago',
      'Completa el proceso de pago en línea',
      'Una vez completado, el pago se confirmará automáticamente',
      'No es necesario subir comprobante'
    ],
    link: 'https://payment.example.com/pay'
  },
  cash: {
    title: 'Efectivo',
    icon: DollarSign,
    instructions: [
      'El pago se realizará en efectivo al inicio de la clase',
      'No es necesario subir comprobante',
      'El instructor confirmará el pago al recibirlo',
      'Tu reserva quedará confirmada una vez recibido el pago'
    ]
  }
};

export default function PaymentUpload({ 
  reservationId, 
  amount, 
  onPaymentSubmitted,
  existingPayment 
}: PaymentUploadProps) {
  const { data: session } = useSession();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    existingPayment?.paymentMethod as PaymentMethod || null
  );
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(
    existingPayment?.voucherImage || null
  );
  const [voucherNotes, setVoucherNotes] = useState<string>(
    existingPayment?.voucherNotes || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para comprimir imágenes
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          const MAX_SIZE = 800 * 1024; // 800KB máximo
          
          let width = img.width;
          let height = img.height;
          
          // Redimensionar si es necesario
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            } else {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Intentar diferentes niveles de calidad hasta que el tamaño sea aceptable
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Error al comprimir la imagen'));
                  return;
                }
                
                if (blob.size > MAX_SIZE && quality > 0.1) {
                  quality -= 0.1;
                  tryCompress();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };
          
          tryCompress();
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (PNG, JPG, JPEG)');
      return;
    }
    setVoucherFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.onerror = () => {
      setError('Error al leer el archivo. Por favor, intenta con otra imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedMethod) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    // Para efectivo, no se requiere comprobante
    if (selectedMethod !== 'cash' && !voucherFile && !voucherPreview && !existingPayment?.voucherImage) {
      setError('Por favor sube el comprobante de pago');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = (session as any)?.backendToken;

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      // Convertir imagen a base64 si existe, con compresión
      let voucherImageBase64: string | null = null;
      if (voucherFile) {
        try {
          // Comprimir imagen antes de convertir a base64
          const compressedFile = await compressImage(voucherFile);
          const reader = new FileReader();
          voucherImageBase64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          });
        } catch (compressError) {
          console.error('Error comprimiendo imagen:', compressError);
          // Si falla la compresión, usar la imagen original
          const reader = new FileReader();
          voucherImageBase64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(voucherFile);
          });
        }
      } else if (voucherPreview) {
        // Si hay una vista previa (puede ser nueva o existente)
        // Solo usar como nueva si no es la misma que la existente
        if (voucherPreview !== existingPayment?.voucherImage) {
          voucherImageBase64 = voucherPreview;
        } else {
          // Mantener la imagen existente
          voucherImageBase64 = existingPayment.voucherImage;
        }
      } else if (existingPayment?.voucherImage) {
        // Mantener la imagen existente si no hay cambios
        voucherImageBase64 = existingPayment.voucherImage;
      }

      // Si hay un pago existente, actualizarlo
      if (existingPayment) {
        const response = await fetch(`/api/payments/${existingPayment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentMethod: selectedMethod,
            voucherImage: voucherImageBase64 || existingPayment.voucherImage || null,
            voucherNotes: voucherNotes || null,
            status: 'PENDING'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar el pago');
        }
      } else {
        // Crear nuevo pago
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            reservationId,
            amount,
            paymentMethod: selectedMethod,
            voucherImage: voucherImageBase64,
            voucherNotes: voucherNotes || null,
            status: selectedMethod === 'cash' ? 'PENDING' : 'PENDING'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el pago');
        }
      }

      setSuccess(true);
      
      setTimeout(() => {
        onPaymentSubmitted();
        // Redirect to reservation details page after 2 seconds
        if (typeof window !== 'undefined') {
          window.location.href = `/reservations/${reservationId}`;
        }
      }, 2000);
    } catch (err) {
      console.error('Error submitting payment:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstructions = selectedMethod ? paymentInstructions[selectedMethod] : null;
  const IconComponent = selectedInstructions?.icon || CreditCard;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Método de Pago</h3>

      {existingPayment && existingPayment.status === 'PAID' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Pago confirmado</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">
              {selectedMethod === 'cash' 
                ? 'Pago registrado. Se confirmará al inicio de la clase.'
                : 'Comprobante enviado. Estamos verificando tu pago.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona el método de pago
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(paymentInstructions).map(([key, info]) => {
              const Icon = info.icon;
              const isSelected = selectedMethod === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMethod(key as PaymentMethod)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {info.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Instructions */}
        {selectedInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <IconComponent className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <h4 className="font-semibold text-blue-900">{selectedInstructions.title}</h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              {selectedInstructions.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>

            {/* Account Info for Transfer/Deposit */}
            {selectedMethod && (selectedMethod === 'transfer' || selectedMethod === 'deposit') && (() => {
              const methodData = paymentInstructions[selectedMethod] as PaymentInstructions['transfer'] | PaymentInstructions['deposit'];
              const accountInfo = methodData.accountInfo;
              return accountInfo ? (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Datos de la cuenta:</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Banco:</span> {accountInfo.bank}</p>
                    <p><span className="font-medium">Tipo:</span> {accountInfo.accountType}</p>
                    <p><span className="font-medium">Número:</span> {accountInfo.accountNumber}</p>
                    <p><span className="font-medium">Titular:</span> {accountInfo.accountName}</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Yape Phone Number */}
            {selectedMethod === 'yape' && (() => {
              const methodData = paymentInstructions[selectedMethod] as PaymentInstructions['yape'];
              const phoneNumber = methodData.phoneNumber;
              return phoneNumber ? (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-sm text-gray-900 mb-1">Número de Yape:</p>
                  <p className="text-lg font-mono text-gray-900">{phoneNumber}</p>
                </div>
              ) : null;
            })()}

            {/* Payment Link */}
            {selectedMethod === 'payment_link' && (() => {
              const methodData = paymentInstructions[selectedMethod] as PaymentInstructions['payment_link'];
              const link = methodData.link;
              return link ? (
                <div className="mt-4">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Ir al Link de Pago
                  </a>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Voucher Upload (not for cash or payment_link) */}
        {selectedMethod && selectedMethod !== 'cash' && selectedMethod !== 'payment_link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante de Pago {existingPayment?.voucherImage ? '(Actualizar)' : ''}
            </label>
            {voucherPreview ? (
              <div className="relative">
                <img
                  src={voucherPreview}
                  alt="Voucher preview"
                  className="w-full h-64 object-contain border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Haz clic o arrastra el comprobante aquí</p>
                <p className="text-sm text-gray-500">PNG, JPG o JPEG (máx. 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={voucherNotes}
            onChange={(e) => setVoucherNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Información adicional sobre el pago..."
          />
        </div>

        {/* Submit Button */}
        {(!existingPayment || existingPayment.status !== 'PAID') && (
          <button
            type="submit"
            disabled={isSubmitting || !selectedMethod}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Procesando...' : selectedMethod === 'cash' ? 'Registrar Pago en Efectivo' : 'Enviar Comprobante'}
          </button>
        )}
      </form>
    </div>
  );
}

