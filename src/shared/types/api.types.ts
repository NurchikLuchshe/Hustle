/**
 * API Types
 * Request/Response types for all API endpoints
 */

import type { Service, Booking, Client, Vendor, BookingStatus } from "./database.types";

// ===========================================
// Common
// ===========================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: "success" | "error";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===========================================
// Auth
// ===========================================

export interface RegisterRequest {
  email: string;
  password: string;
  businessName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  vendor: Vendor | null;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

// ===========================================
// Vendor
// ===========================================

export interface UpdateVendorRequest {
  business_name?: string;
  description?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  locale?: string;
  booking_settings?: Partial<Vendor["booking_settings"]>;
  ai_config?: Partial<Vendor["ai_config"]>;
}

export interface OnboardingRequest {
  businessName: string;
  phone?: string;
  timezone: string;
  priceListImage?: string; // base64
}

export interface OnboardingResponse {
  vendor: Vendor;
  recognizedServices: Array<{
    name: string;
    price: number;
    duration_minutes: number;
    category: string | null;
  }>;
}

// ===========================================
// Services
// ===========================================

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category?: string;
  price: number;
  price_type?: "fixed" | "from" | "range";
  price_max?: number;
  duration_minutes: number;
  buffer_after_minutes?: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  is_active?: boolean;
  is_online_bookable?: boolean;
  sort_order?: number;
}

export interface ServiceWithStats extends Service {
  bookings_count: number;
  revenue: number;
}

// ===========================================
// Bookings
// ===========================================

export interface CreateBookingRequest {
  service_id: string;
  start_time: string; // ISO 8601
  client_phone: string;
  client_name?: string;
  notes?: string;
  source?: "web" | "telegram" | "instagram" | "manual";
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  start_time?: string;
  notes?: string;
  internal_notes?: string;
  cancellation_reason?: string;
}

export interface BookingWithDetails extends Booking {
  service: Pick<Service, "id" | "name" | "price" | "duration_minutes">;
  client: Pick<Client, "id" | "name" | "phone" | "telegram_id"> | null;
}

export interface GetBookingsQuery {
  start_date?: string;
  end_date?: string;
  status?: BookingStatus;
  client_id?: string;
  page?: number;
  pageSize?: number;
}

// ===========================================
// Clients
// ===========================================

export interface CreateClientRequest {
  phone?: string;
  telegram_id?: number;
  name?: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  preferences?: Record<string, unknown>;
  marketing_consent?: boolean;
}

export interface ClientWithStats extends Client {
  upcoming_bookings: number;
}

export interface GetClientsQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

// ===========================================
// Slots (Public API)
// ===========================================

export interface GetSlotsRequest {
  service_id: string;
  date: string; // YYYY-MM-DD
}

export interface AvailableSlot {
  time: string; // HH:MM
  datetime: string; // ISO 8601
}

export interface GetSlotsResponse {
  date: string;
  service: Pick<Service, "id" | "name" | "price" | "duration_minutes">;
  slots: AvailableSlot[];
}

// ===========================================
// Public Booking
// ===========================================

export interface PublicBookingRequest {
  service_id: string;
  datetime: string;
  phone: string;
  name?: string;
  notes?: string;
}

export interface PublicBookingResponse {
  booking: Pick<Booking, "id" | "start_time" | "end_time" | "status">;
  service: Pick<Service, "name" | "price">;
  vendor: Pick<Vendor, "business_name" | "phone">;
  verification_required: boolean;
}

// ===========================================
// Verification
// ===========================================

export interface SendOTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  code: string;
}

export interface VerifyOTPResponse {
  verified: boolean;
  client_id?: string;
}

// ===========================================
// Analytics
// ===========================================

export interface AnalyticsQuery {
  start_date: string;
  end_date: string;
}

export interface AnalyticsSummary {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_shows: number;
  total_revenue: number;
  new_clients: number;
  returning_clients: number;
  avg_booking_value: number;
}

export interface BookingsByDay {
  date: string;
  count: number;
  revenue: number;
}

export interface TopServices {
  service_id: string;
  service_name: string;
  bookings_count: number;
  revenue: number;
}

// ===========================================
// AI
// ===========================================

export interface AIMessageRequest {
  vendor_id: string;
  conversation_id?: string;
  message: string;
  platform: "telegram" | "instagram" | "web";
  platform_user_id?: string;
}

export interface AIMessageResponse {
  response: string;
  conversation_id: string;
  tools_called: Array<{
    name: string;
    args: Record<string, unknown>;
    result: unknown;
  }>;
  tokens_used: number;
  should_handoff: boolean;
}

// ===========================================
// Telegram Webhook
// ===========================================

export interface TelegramWebhookPayload {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  business_message?: TelegramMessage;
  business_connection?: TelegramBusinessConnection;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  voice?: TelegramVoice;
  contact?: TelegramContact;
  business_connection_id?: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  chat_instance: string;
  data?: string;
}

export interface TelegramBusinessConnection {
  id: string;
  user: TelegramUser;
  user_chat_id: number;
  date: number;
  can_reply: boolean;
  is_enabled: boolean;
}
