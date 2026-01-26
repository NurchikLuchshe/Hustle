/**
 * Telegram Bot Session Manager
 * Stores user booking flow state
 */

export interface BookingSession {
    step: BookingStep;
    vendorId?: string;
    vendorSlug?: string;
    vendorName?: string;
    serviceId?: string;
    serviceName?: string;
    serviceDuration?: number;
    servicePrice?: number;
    date?: string;
    time?: string;
    clientName?: string;
    clientPhone?: string;
    messageId?: number; // For editing messages
    updatedAt: number;
}

export type BookingStep =
    | "idle"
    | "select_vendor"
    | "select_service"
    | "select_date"
    | "select_time"
    | "enter_name"
    | "enter_phone"
    | "confirm"
    | "ai_chat"
    // Vendor registration steps
    | "register_business_name"
    | "register_slug"
    | "register_phone";

// In-memory session storage (for production, use Redis or DB)
const sessions = new Map<number, BookingSession>();

// Session TTL: 30 minutes
const SESSION_TTL = 30 * 60 * 1000;

export function getSession(userId: number): BookingSession {
    const session = sessions.get(userId);

    // Check if session expired
    if (session && Date.now() - session.updatedAt > SESSION_TTL) {
        sessions.delete(userId);
        return createSession(userId);
    }

    return session || createSession(userId);
}

export function createSession(userId: number): BookingSession {
    const session: BookingSession = {
        step: "idle",
        updatedAt: Date.now(),
    };
    sessions.set(userId, session);
    return session;
}

export function updateSession(
    userId: number,
    updates: Partial<BookingSession>
): BookingSession {
    const session = getSession(userId);
    const updated = {
        ...session,
        ...updates,
        updatedAt: Date.now(),
    };
    sessions.set(userId, updated);
    return updated;
}

export function clearSession(userId: number): void {
    sessions.delete(userId);
}

export function resetSession(userId: number): BookingSession {
    return createSession(userId);
}
