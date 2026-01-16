/**
 * Shared Utilities
 * Pure functions used across the codebase
 */

import { CURRENCIES, ESTIMATED_DURATIONS } from "../constants";
import type { CurrencyCode } from "../constants";

// ===========================================
// Date & Time
// ===========================================

/**
 * Format time for display (HH:MM)
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", options);
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/**
 * Get day of week (0 = Monday, 6 = Sunday)
 * Note: JS Date.getDay() returns 0 = Sunday, we adjust for Monday-first
 */
export function getDayOfWeek(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const jsDay = d.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Parse time string (HH:MM) to minutes from midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date();
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Get relative time string (e.g., "через 2 часа", "вчера")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMins < 0) {
    // Past
    if (diffMins > -60) return `${-diffMins} мин. назад`;
    if (diffHours > -24) return `${-diffHours} ч. назад`;
    if (diffDays > -7) return `${-diffDays} дн. назад`;
    return formatDate(d);
  } else {
    // Future
    if (diffMins < 60) return `через ${diffMins} мин.`;
    if (diffHours < 24) return `через ${diffHours} ч.`;
    if (diffDays < 7) return `через ${diffDays} дн.`;
    return formatDate(d);
  }
}

// ===========================================
// Currency & Price
// ===========================================

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = "RUB"
): string {
  const config = CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price range
 */
export function formatPriceRange(
  min: number,
  max: number | null,
  currency: CurrencyCode = "RUB"
): string {
  if (max && max > min) {
    return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
  }
  return `от ${formatPrice(min, currency)}`;
}

// ===========================================
// Phone
// ===========================================

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, "");

  // Handle Russian numbers
  if (digits.startsWith("8") && digits.length === 11) {
    digits = "7" + digits.slice(1);
  }

  // Add + if missing
  if (!digits.startsWith("+")) {
    digits = "+" + digits;
  }

  return digits;
}

/**
 * Format phone for display
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);

  // Russian format: +7 (999) 123-45-67
  if (normalized.startsWith("+7") && normalized.length === 12) {
    return normalized.replace(
      /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/,
      "+7 ($1) $2-$3-$4"
    );
  }

  return normalized;
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Check for valid E.164 format (+ followed by 10-15 digits)
  return /^\+\d{10,15}$/.test(normalized);
}

/**
 * Mask phone for privacy
 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 8) return normalized;
  return normalized.slice(0, 4) + "****" + normalized.slice(-4);
}

// ===========================================
// String Utilities
// ===========================================

/**
 * Generate a random slug
 */
export function generateSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, "")
    .replace(/\s+/g, "-")
    .slice(0, 20);

  const random = Math.random().toString(36).slice(2, 6);
  return `${base}-${random}`;
}

/**
 * Generate a random code (for OTP, etc.)
 */
export function generateCode(length: number = 4): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===========================================
// Duration Estimation
// ===========================================

/**
 * Estimate service duration based on name
 */
export function estimateDuration(serviceName: string): number {
  const name = serviceName.toLowerCase().trim();

  // Exact match
  if (ESTIMATED_DURATIONS[name]) {
    return ESTIMATED_DURATIONS[name];
  }

  // Partial match
  for (const [key, duration] of Object.entries(ESTIMATED_DURATIONS)) {
    if (name.includes(key) || key.includes(name)) {
      return duration;
    }
  }

  // Default
  return 60;
}

// ===========================================
// Validation
// ===========================================

/**
 * Check if value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Check if value is a valid email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===========================================
// Array Utilities
// ===========================================

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// ===========================================
// Time Preference Parsing
// ===========================================

type TimePreference = "morning" | "afternoon" | "evening" | "any";

interface TimeRange {
  start: string;
  end: string;
}

/**
 * Parse time preference to time range
 */
export function getTimeRange(preference: TimePreference): TimeRange {
  switch (preference) {
    case "morning":
      return { start: "09:00", end: "12:00" };
    case "afternoon":
      return { start: "12:00", end: "17:00" };
    case "evening":
      return { start: "17:00", end: "21:00" };
    default:
      return { start: "09:00", end: "21:00" };
  }
}

/**
 * Detect time preference from natural language
 */
export function detectTimePreference(text: string): TimePreference {
  const lower = text.toLowerCase();

  if (/утр|с утра|утром|пораньше/.test(lower)) {
    return "morning";
  }
  if (/обед|днём|днем|после обеда/.test(lower)) {
    return "afternoon";
  }
  if (/вечер|после работы|попозже/.test(lower)) {
    return "evening";
  }

  return "any";
}
