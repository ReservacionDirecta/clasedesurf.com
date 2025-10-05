import { z } from 'zod'

// Enums locales que coinciden con los del backend
enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN'
}

enum ClassLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED'
}

enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

enum SwimmingLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

enum ClassType {
  GROUP = 'GROUP',
  PRIVATE = 'PRIVATE',
  SEMI_PRIVATE = 'SEMI_PRIVATE'
}

enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  PAYPAL = 'PAYPAL'
}

enum EquipmentType {
  BOARD = 'BOARD',
  WETSUIT = 'WETSUIT',
  LEASH = 'LEASH',
  WAX = 'WAX'
}

enum EquipmentCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export const userLoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es requerida'),
})

export const userProfileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  age: z.number()
    .min(5, 'La edad mínima es 5 años')
    .max(100, 'La edad máxima es 100 años')
    .optional(),
  weight: z.number()
    .min(20, 'El peso mínimo es 20 kg')
    .max(200, 'El peso máximo es 200 kg')
    .optional(),
  height: z.number()
    .min(100, 'La altura mínima es 100 cm')
    .max(250, 'La altura máxima es 250 cm')
    .optional(),
  canSwim: z.boolean(),
  swimmingLevel: z.nativeEnum(SwimmingLevel),
  injuries: z.string()
    .max(1000, 'La descripción de lesiones no puede exceder 1000 caracteres')
    .optional(),
  emergencyContact: z.string()
    .max(100, 'El contacto de emergencia no puede exceder 100 caracteres')
    .optional(),
  emergencyPhone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .optional(),
})

// ============================================================================
// SCHOOL VALIDATION SCHEMAS
// ============================================================================

export const schoolSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: z.string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(50, 'El slug no puede exceder 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .optional(),
  website: z.string()
    .url('URL inválida')
    .optional(),
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  state: z.string()
    .max(100, 'El estado no puede exceder 100 caracteres')
    .optional(),
  country: z.string()
    .length(2, 'El código de país debe tener 2 caracteres')
    .default('ES'),
  latitude: z.number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  longitude: z.number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
})

// ============================================================================
// CLASS VALIDATION SCHEMAS
// ============================================================================

export const classSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  capacity: z.number()
    .min(1, 'La capacidad mínima es 1 persona')
    .max(50, 'La capacidad máxima es 50 personas'),
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000, 'El precio máximo es 1000€'),
  level: z.nativeEnum(ClassLevel),
  type: z.nativeEnum(ClassType),
  location: z.string()
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .optional(),
  instructorName: z.string()
    .max(100, 'El nombre del instructor no puede exceder 100 caracteres')
    .optional(),
  includesBoard: z.boolean().default(true),
  includesWetsuit: z.boolean().default(true),
  includesInsurance: z.boolean().default(true),
  minWaveHeight: z.number()
    .min(0, 'La altura mínima de ola no puede ser negativa')
    .max(10, 'La altura mínima de ola no puede exceder 10 metros')
    .optional(),
  maxWaveHeight: z.number()
    .min(0, 'La altura máxima de ola no puede ser negativa')
    .max(20, 'La altura máxima de ola no puede exceder 20 metros')
    .optional(),
}).refine((data) => {
  const startTime = new Date(`2000-01-01T${data.startTime}:00`)
  const endTime = new Date(`2000-01-01T${data.endTime}:00`)
  return startTime < endTime
}, {
  message: "La hora de inicio debe ser anterior a la hora de fin",
  path: ["endTime"],
}).refine((data) => {
  if (data.minWaveHeight && data.maxWaveHeight) {
    return data.minWaveHeight <= data.maxWaveHeight
  }
  return true
}, {
  message: "La altura mínima de ola debe ser menor o igual a la máxima",
  path: ["maxWaveHeight"],
})

// ============================================================================
// RESERVATION VALIDATION SCHEMAS
// ============================================================================

export const reservationSchema = z.object({
  classId: z.string()
    .cuid('ID de clase inválido'),
  participants: z.number()
    .min(1, 'Debe haber al menos 1 participante')
    .max(10, 'Máximo 10 participantes por reserva'),
  specialRequest: z.string()
    .max(500, 'Los requerimientos especiales no pueden exceder 500 caracteres')
    .optional(),
})

export const reservationUpdateSchema = z.object({
  status: z.nativeEnum(ReservationStatus),
  cancelReason: z.string()
    .max(500, 'El motivo de cancelación no puede exceder 500 caracteres')
    .optional(),
})

// ============================================================================
// PAYMENT VALIDATION SCHEMAS
// ============================================================================

export const paymentSchema = z.object({
  reservationId: z.string()
    .cuid('ID de reserva inválido'),
  amount: z.number()
    .min(0.01, 'El monto mínimo es 0.01€')
    .max(10000, 'El monto máximo es 10,000€'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string()
    .max(100, 'El ID de transacción no puede exceder 100 caracteres')
    .optional(),
})

export const paymentUpdateSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  transactionId: z.string()
    .max(100, 'El ID de transacción no puede exceder 100 caracteres')
    .optional(),
  refundAmount: z.number()
    .min(0, 'El monto de reembolso no puede ser negativo')
    .optional(),
  refundReason: z.string()
    .max(500, 'El motivo de reembolso no puede exceder 500 caracteres')
    .optional(),
})

// ============================================================================
// REVIEW VALIDATION SCHEMAS
// ============================================================================

export const reviewSchema = z.object({
  reservationId: z.string()
    .cuid('ID de reserva inválido'),
  rating: z.number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  title: z.string()
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional(),
  comment: z.string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .optional(),
  instructorRating: z.number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  equipmentRating: z.number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  locationRating: z.number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  valueRating: z.number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
})

// ============================================================================
// EQUIPMENT VALIDATION SCHEMAS
// ============================================================================

export const equipmentSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  type: z.nativeEnum(EquipmentType),
  brand: z.string()
    .max(50, 'La marca no puede exceder 50 caracteres')
    .optional(),
  model: z.string()
    .max(50, 'El modelo no puede exceder 50 caracteres')
    .optional(),
  size: z.string()
    .max(20, 'La talla no puede exceder 20 caracteres')
    .optional(),
  condition: z.nativeEnum(EquipmentCondition),
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
})

// ============================================================================
// FILTER VALIDATION SCHEMAS
// ============================================================================

export const classFiltersSchema = z.object({
  schoolId: z.string().cuid().optional(),
  level: z.nativeEnum(ClassLevel).optional(),
  type: z.nativeEnum(ClassType).optional(),
  dateFrom: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida').optional(),
  dateTo: z.string().refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida').optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  location: z.string().max(200).optional(),
  availableOnly: z.boolean().optional(),
})

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type SchoolInput = z.infer<typeof schoolSchema>
export type ClassInput = z.infer<typeof classSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type EquipmentInput = z.infer<typeof equipmentSchema>
export type ClassFiltersInput = z.infer<typeof classFiltersSchema>
export type PaginationInput = z.infer<typeof paginationSchema>