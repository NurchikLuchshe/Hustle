/**
 * Zod Validation Schemas
 * Shared between frontend and backend
 */

import { z } from "zod";

// ===========================================
// Common Schemas
// ===========================================

export const phoneSchema = z
  .string()
  .min(10, "Номер телефона слишком короткий")
  .max(15, "Номер телефона слишком длинный")
  .regex(/^\+?\d{10,15}$/, "Неверный формат номера телефона");

export const emailSchema = z
  .string()
  .email("Неверный формат email")
  .min(1, "Email обязателен");

export const uuidSchema = z
  .string()
  .uuid("Неверный формат ID");

export const slugSchema = z
  .string()
  .min(3, "Минимум 3 символа")
  .max(50, "Максимум 50 символов")
  .regex(
    /^[a-z0-9-]+$/,
    "Только латинские буквы, цифры и дефис"
  );

// ===========================================
// Auth Schemas
// ===========================================

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(72, "Максимум 72 символа"),
  businessName: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(100, "Максимум 100 символов"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ===========================================
// Vendor Schemas
// ===========================================

export const vendorProfileSchema = z.object({
  business_name: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(100, "Максимум 100 символов"),
  description: z
    .string()
    .max(500, "Максимум 500 символов")
    .optional(),
  phone: phoneSchema.optional(),
  timezone: z.string(),
  currency: z.enum(["RUB", "USD", "EUR", "UZS", "KZT", "BYN", "UAH"]),
  locale: z.enum(["ru", "en", "uz"]),
});

export const bookingSettingsSchema = z.object({
  min_advance_hours: z.number().min(0).max(72),
  max_advance_days: z.number().min(1).max(365),
  buffer_minutes: z.number().min(0).max(60),
  require_phone_verification: z.boolean(),
  auto_confirm: z.boolean(),
});

export const aiConfigSchema = z.object({
  personality: z.enum(["formal", "friendly", "neutral"]),
  language: z.enum(["ru", "en", "uz"]),
  custom_instructions: z.string().max(1000).optional(),
  emoji_usage: z.enum(["none", "moderate", "frequent"]),
});

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;
export type BookingSettingsInput = z.infer<typeof bookingSettingsSchema>;
export type AIConfigInput = z.infer<typeof aiConfigSchema>;

// ===========================================
// Service Schemas
// ===========================================

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(100, "Максимум 100 символов"),
  description: z
    .string()
    .max(500, "Максимум 500 символов")
    .optional(),
  category: z.string().optional(),
  price: z
    .number()
    .min(0, "Цена не может быть отрицательной")
    .max(1000000, "Слишком большая цена"),
  price_type: z.enum(["fixed", "from", "range"]).default("fixed"),
  price_max: z
    .number()
    .min(0)
    .max(1000000)
    .optional()
    .nullable(),
  duration_minutes: z
    .number()
    .min(5, "Минимум 5 минут")
    .max(480, "Максимум 8 часов"),
  buffer_after_minutes: z
    .number()
    .min(0)
    .max(60)
    .default(0),
  is_active: z.boolean().default(true),
  is_online_bookable: z.boolean().default(true),
});

export const serviceOrderSchema = z.object({
  services: z.array(
    z.object({
      id: uuidSchema,
      sort_order: z.number().min(0),
    })
  ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ===========================================
// Work Schedule Schemas
// ===========================================

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Формат HH:MM");

export const breakSchema = z.object({
  start: timeSchema,
  end: timeSchema,
  name: z.string().max(50).optional(),
});

export const workScheduleSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: timeSchema,
  end_time: timeSchema,
  breaks: z.array(breakSchema).default([]),
  is_working_day: z.boolean(),
});

export const weekScheduleSchema = z.array(workScheduleSchema).length(7);

export type WorkScheduleInput = z.infer<typeof workScheduleSchema>;

// ===========================================
// Schedule Exception Schemas
// ===========================================

export const scheduleExceptionSchema = z.object({
  exception_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат YYYY-MM-DD"),
  exception_type: z.enum(["day_off", "custom_hours"]),
  start_time: timeSchema.optional(),
  end_time: timeSchema.optional(),
  reason: z.string().max(200).optional(),
}).refine(
  (data) => {
    if (data.exception_type === "custom_hours") {
      return data.start_time && data.end_time;
    }
    return true;
  },
  { message: "Для изменённых часов укажите время начала и окончания" }
);

export type ScheduleExceptionInput = z.infer<typeof scheduleExceptionSchema>;

// ===========================================
// Booking Schemas
// ===========================================

export const createBookingSchema = z.object({
  service_id: uuidSchema,
  start_time: z.string().datetime(),
  client_phone: phoneSchema,
  client_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  source: z.enum(["web", "telegram", "instagram", "manual", "phone"]).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]).optional(),
  start_time: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  internal_notes: z.string().max(500).optional(),
  cancellation_reason: z.string().max(200).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// ===========================================
// Client Schemas
// ===========================================

export const clientSchema = z.object({
  phone: phoneSchema.optional(),
  telegram_id: z.number().optional(),
  name: z.string().max(100).optional(),
  email: emailSchema.optional(),
  notes: z.string().max(1000).optional(),
  preferences: z.record(z.unknown()).optional(),
  marketing_consent: z.boolean().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// ===========================================
// Public Booking Schemas
// ===========================================

export const publicBookingSchema = z.object({
  service_id: uuidSchema,
  datetime: z.string().datetime(),
  phone: phoneSchema,
  name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(4, "Код должен быть 4 цифры"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// ===========================================
// AI Recognition Schemas (from GPT-4V)
// ===========================================

export const recognizedServiceSchema = z.object({
  name: z.string(),
  price: z.number(),
  price_type: z.enum(["fixed", "from", "range"]).default("fixed"),
  price_max: z.number().optional().nullable(),
  currency: z.string().default("RUB"),
  duration_minutes: z.number(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const priceListRecognitionSchema = z.object({
  success: z.boolean(),
  services: z.array(recognizedServiceSchema),
  detected_language: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  error: z.string().optional(),
});

export type RecognizedService = z.infer<typeof recognizedServiceSchema>;
export type PriceListRecognition = z.infer<typeof priceListRecognitionSchema>;
