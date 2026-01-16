/**
 * Shared Constants
 * Used across frontend, backend, and bot
 */

// ===========================================
// Plans & Limits
// ===========================================

export const PLANS = {
  start: {
    name: "Start",
    price: 0,
    bookingsLimit: 50,
    aiTokensLimit: 0,
    features: {
      webWidget: true,
      telegramBot: false,
      instagramDM: false,
      telegramBusiness: false,
      analytics: false,
      customBranding: false,
    },
  },
  pro: {
    name: "Pro",
    price: 19,
    bookingsLimit: null, // unlimited
    aiTokensLimit: 500,
    features: {
      webWidget: true,
      telegramBot: true,
      instagramDM: false,
      telegramBusiness: false,
      analytics: true,
      customBranding: false,
    },
  },
  business: {
    name: "Business",
    price: 49,
    bookingsLimit: null,
    aiTokensLimit: 2000,
    features: {
      webWidget: true,
      telegramBot: true,
      instagramDM: true,
      telegramBusiness: true,
      analytics: true,
      customBranding: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// ===========================================
// Booking Settings Defaults
// ===========================================

export const DEFAULT_BOOKING_SETTINGS = {
  min_advance_hours: 2,
  max_advance_days: 30,
  buffer_minutes: 15,
  require_phone_verification: true,
  auto_confirm: true,
} as const;

// ===========================================
// Service Categories
// ===========================================

export const SERVICE_CATEGORIES = {
  haircut: { label: "Стрижки", emoji: "✂️" },
  coloring: { label: "Окрашивание", emoji: "🎨" },
  styling: { label: "Укладки", emoji: "💇" },
  nails: { label: "Маникюр/Педикюр", emoji: "💅" },
  massage: { label: "Массаж", emoji: "💆" },
  facial: { label: "Уход за лицом", emoji: "🧴" },
  brows: { label: "Брови/Ресницы", emoji: "👁️" },
  waxing: { label: "Эпиляция", emoji: "🌸" },
  makeup: { label: "Макияж", emoji: "💄" },
  tutoring: { label: "Репетиторство", emoji: "📚" },
  photography: { label: "Фотография", emoji: "📷" },
  other: { label: "Другое", emoji: "📋" },
} as const;

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES;

// ===========================================
// Estimated Durations (for AI)
// ===========================================

export const ESTIMATED_DURATIONS: Record<string, number> = {
  // Haircuts
  "мужская стрижка": 45,
  "женская стрижка": 60,
  "детская стрижка": 30,
  стрижка: 45,

  // Coloring
  окрашивание: 120,
  мелирование: 150,
  тонирование: 90,
  "окрашивание корней": 60,

  // Styling
  укладка: 45,
  "вечерняя укладка": 60,
  локоны: 45,

  // Nails
  маникюр: 60,
  педикюр: 90,
  "маникюр с покрытием": 75,
  "педикюр с покрытием": 105,
  "наращивание ногтей": 120,

  // Face
  чистка: 60,
  "чистка лица": 60,
  пилинг: 45,
  "уход за лицом": 60,

  // Massage
  массаж: 60,
  "массаж спины": 45,
  "массаж всего тела": 90,
  "антицеллюлитный массаж": 60,

  // Brows
  брови: 30,
  "коррекция бровей": 30,
  "окрашивание бровей": 30,
  ресницы: 60,
  "наращивание ресниц": 120,
  ламинирование: 60,
};

// ===========================================
// Timezones (Common)
// ===========================================

export const COMMON_TIMEZONES = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/Samara", label: "Самара (UTC+4)" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург (UTC+5)" },
  { value: "Asia/Novosibirsk", label: "Новосибирск (UTC+7)" },
  { value: "Asia/Vladivostok", label: "Владивосток (UTC+10)" },
  { value: "Asia/Tashkent", label: "Ташкент (UTC+5)" },
  { value: "Asia/Almaty", label: "Алматы (UTC+6)" },
  { value: "Europe/Minsk", label: "Минск (UTC+3)" },
  { value: "Europe/Kiev", label: "Киев (UTC+2)" },
] as const;

// ===========================================
// Currencies
// ===========================================

export const CURRENCIES = {
  RUB: { symbol: "₽", name: "Рубль", locale: "ru-RU" },
  USD: { symbol: "$", name: "Dollar", locale: "en-US" },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE" },
  UZS: { symbol: "сум", name: "Сум", locale: "uz-UZ" },
  KZT: { symbol: "₸", name: "Тенге", locale: "kk-KZ" },
  BYN: { symbol: "Br", name: "Рубль", locale: "be-BY" },
  UAH: { symbol: "₴", name: "Гривня", locale: "uk-UA" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// ===========================================
// Days of Week
// ===========================================

export const DAYS_OF_WEEK = [
  { value: 0, label: "Понедельник", short: "Пн" },
  { value: 1, label: "Вторник", short: "Вт" },
  { value: 2, label: "Среда", short: "Ср" },
  { value: 3, label: "Четверг", short: "Чт" },
  { value: 4, label: "Пятница", short: "Пт" },
  { value: 5, label: "Суббота", short: "Сб" },
  { value: 6, label: "Воскресенье", short: "Вс" },
] as const;

// ===========================================
// Booking Statuses
// ===========================================

export const BOOKING_STATUSES = {
  pending: { label: "Ожидает", color: "yellow", icon: "clock" },
  confirmed: { label: "Подтверждено", color: "green", icon: "check" },
  cancelled: { label: "Отменено", color: "red", icon: "x" },
  completed: { label: "Завершено", color: "blue", icon: "check-circle" },
  no_show: { label: "Не пришёл", color: "gray", icon: "user-x" },
} as const;

// ===========================================
// AI Personalities
// ===========================================

export const AI_PERSONALITIES = {
  formal: {
    label: "Формальный",
    description: "Здравствуйте, чем могу помочь?",
    greeting: "Здравствуйте! Чем могу помочь?",
    farewell: "Благодарю за обращение. Хорошего дня!",
  },
  friendly: {
    label: "Дружелюбный",
    description: "Привет! Рада тебя слышать!",
    greeting: "Привет! Рада, что написал(а)!",
    farewell: "До встречи! Хорошего дня!",
  },
  neutral: {
    label: "Нейтральный",
    description: "Добрый день. Готов помочь с записью.",
    greeting: "Добрый день! Готов помочь с записью.",
    farewell: "До свидания!",
  },
} as const;

// ===========================================
// Error Messages
// ===========================================

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: "Неверный email или пароль",
  EMAIL_TAKEN: "Этот email уже зарегистрирован",
  UNAUTHORIZED: "Необходима авторизация",

  // Booking
  SLOT_NOT_AVAILABLE: "Это время уже занято",
  PAST_DATE: "Нельзя записаться на прошедшую дату",
  TOO_FAR_AHEAD: "Записаться можно максимум на {days} дней вперёд",
  TOO_SOON: "Записаться можно минимум за {hours} часов",

  // Validation
  INVALID_PHONE: "Неверный формат телефона",
  INVALID_DATE: "Неверный формат даты",

  // General
  SOMETHING_WENT_WRONG: "Что-то пошло не так. Попробуйте позже.",
  NOT_FOUND: "Не найдено",
} as const;
