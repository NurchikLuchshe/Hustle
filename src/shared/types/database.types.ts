/**
 * Database Types
 * Auto-generated from Supabase schema
 * Run `npm run db:types` to regenerate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          business_name: string;
          description: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          timezone: string;
          currency: string;
          locale: string;
          booking_settings: BookingSettings;
          telegram_config: TelegramConfig;
          instagram_config: InstagramConfig;
          ai_config: AIConfig;
          plan: Plan;
          plan_expires_at: string | null;
          ai_tokens_used: number;
          ai_tokens_limit: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["vendors"]["Row"],
          "id" | "created_at" | "updated_at" | "ai_tokens_used"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          ai_tokens_used?: number;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          description: string | null;
          category: string | null;
          price: number;
          price_type: PriceType;
          price_max: number | null;
          duration_minutes: number;
          buffer_after_minutes: number;
          is_active: boolean;
          is_online_bookable: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          vendor_id: string;
          phone: string | null;
          telegram_id: number | null;
          instagram_id: string | null;
          name: string | null;
          email: string | null;
          notes: string | null;
          preferences: Json;
          total_bookings: number;
          total_spent: number;
          last_visit_at: string | null;
          marketing_consent: boolean;
          referral_code: string | null;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"],
          "id" | "created_at" | "updated_at" | "total_bookings" | "total_spent"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          total_bookings?: number;
          total_spent?: number;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          vendor_id: string;
          client_id: string | null;
          service_id: string | null;
          start_time: string;
          end_time: string;
          status: BookingStatus;
          source: BookingSource;
          price: number | null;
          reminder_24h_sent: boolean;
          reminder_2h_sent: boolean;
          notes: string | null;
          internal_notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"],
          "id" | "created_at" | "updated_at" | "reminder_24h_sent" | "reminder_2h_sent"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          reminder_24h_sent?: boolean;
          reminder_2h_sent?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      work_schedules: {
        Row: {
          id: string;
          vendor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          breaks: Break[];
          is_working_day: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["work_schedules"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["work_schedules"]["Insert"]>;
      };
      schedule_exceptions: {
        Row: {
          id: string;
          vendor_id: string;
          exception_date: string;
          exception_type: "day_off" | "custom_hours";
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["schedule_exceptions"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedule_exceptions"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          vendor_id: string;
          client_id: string | null;
          platform: Platform;
          platform_chat_id: string | null;
          context: ConversationContext;
          last_message_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"],
          "id" | "created_at" | "last_message_at"
        > & {
          id?: string;
          created_at?: string;
          last_message_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          function_name: string | null;
          function_args: Json | null;
          function_result: Json | null;
          tokens_used: number | null;
          model_used: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      verification_codes: {
        Row: {
          id: string;
          phone: string;
          code: string;
          expires_at: string;
          attempts: number;
          is_used: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["verification_codes"]["Row"],
          "id" | "created_at" | "attempts" | "is_used"
        > & {
          id?: string;
          created_at?: string;
          attempts?: number;
          is_used?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["verification_codes"]["Insert"]>;
      };
      qr_links: {
        Row: {
          id: string;
          vendor_id: string;
          short_code: string;
          target_type: "telegram" | "web" | "auto";
          clicks: number;
          last_clicked_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["qr_links"]["Row"],
          "id" | "created_at" | "clicks"
        > & {
          id?: string;
          created_at?: string;
          clicks?: number;
        };
        Update: Partial<Database["public"]["Tables"]["qr_links"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {
      get_available_slots: {
        Args: {
          p_vendor_id: string;
          p_service_id: string;
          p_date: string;
        };
        Returns: { slot_time: string }[];
      };
      match_embeddings: {
        Args: {
          p_vendor_id: string;
          p_query_embedding: number[];
          p_match_count?: number;
          p_match_threshold?: number;
        };
        Returns: {
          id: string;
          content: string;
          similarity: number;
          metadata: Json;
        }[];
      };
    };
    Enums: {};
  };
}

// ===========================================
// Custom Types
// ===========================================

export type Plan = "start" | "pro" | "business";
export type PriceType = "fixed" | "from" | "range";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type BookingSource = "web" | "telegram" | "instagram" | "manual" | "phone";
export type Platform = "telegram" | "instagram" | "web";
export type MessageRole = "user" | "assistant" | "system" | "function";

export interface BookingSettings {
  min_advance_hours: number;
  max_advance_days: number;
  buffer_minutes: number;
  require_phone_verification: boolean;
  auto_confirm: boolean;
}

export interface TelegramConfig {
  bot_token?: string;
  business_connection_id?: string;
  webhook_secret?: string;
}

export interface InstagramConfig {
  page_id?: string;
  access_token?: string;
  token_expires_at?: string;
}

export interface AIConfig {
  personality: "formal" | "friendly" | "neutral";
  language: string;
  custom_instructions: string;
  emoji_usage: "none" | "moderate" | "frequent";
}

export interface Break {
  start: string;
  end: string;
  name?: string;
}

export interface ConversationContext {
  current_intent?: string;
  selected_service?: string;
  selected_date?: string;
  selected_time?: string;
  awaiting_confirmation?: boolean;
}

// ===========================================
// Helper Types
// ===========================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience aliases
export type Vendor = Tables<"vendors">;
export type Service = Tables<"services">;
export type Client = Tables<"clients">;
export type Booking = Tables<"bookings">;
export type WorkSchedule = Tables<"work_schedules">;
export type ScheduleException = Tables<"schedule_exceptions">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type VerificationCode = Tables<"verification_codes">;
export type QRLink = Tables<"qr_links">;
