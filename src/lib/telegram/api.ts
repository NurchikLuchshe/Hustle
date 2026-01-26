/**
 * Telegram Bot API helpers for Next.js
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN not set");
    }
    return token;
}

async function telegramRequest<T>(
    method: string,
    body?: Record<string, unknown>
): Promise<T> {
    const token = getBotToken();
    const url = `${TELEGRAM_API_BASE}${token}/${method}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!data.ok) {
        console.error("Telegram API error:", data);
        throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
}

// ===========================================
// Message Functions
// ===========================================

export async function sendMessage(
    chatId: number | string,
    text: string,
    options?: {
        parseMode?: "HTML" | "Markdown" | "MarkdownV2";
        replyMarkup?: TelegramReplyMarkup;
    }
): Promise<TelegramMessage> {
    return telegramRequest<TelegramMessage>("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        reply_markup: options?.replyMarkup,
    });
}

export async function sendMessageWithKeyboard(
    chatId: number | string,
    text: string,
    keyboard: InlineKeyboardButton[][],
    parseMode?: "HTML" | "Markdown" | "MarkdownV2"
): Promise<TelegramMessage> {
    return sendMessage(chatId, text, {
        parseMode,
        replyMarkup: { inline_keyboard: keyboard },
    });
}

export async function editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    options?: {
        parseMode?: "HTML" | "Markdown" | "MarkdownV2";
        replyMarkup?: InlineKeyboardMarkup;
    }
): Promise<TelegramMessage> {
    return telegramRequest<TelegramMessage>("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: options?.parseMode,
        reply_markup: options?.replyMarkup,
    });
}

export async function answerCallbackQuery(
    callbackQueryId: string,
    options?: { text?: string; showAlert?: boolean }
): Promise<boolean> {
    return telegramRequest<boolean>("answerCallbackQuery", {
        callback_query_id: callbackQueryId,
        text: options?.text,
        show_alert: options?.showAlert,
    });
}

export async function requestContact(
    chatId: number | string,
    text: string
): Promise<TelegramMessage> {
    return sendMessage(chatId, text, {
        replyMarkup: {
            keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
            one_time_keyboard: true,
            resize_keyboard: true,
        },
    });
}

export async function removeKeyboard(
    chatId: number | string,
    text: string
): Promise<TelegramMessage> {
    return sendMessage(chatId, text, {
        replyMarkup: { remove_keyboard: true },
    });
}

// ===========================================
// Types
// ===========================================

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    contact?: TelegramContact;
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
    first_name?: string;
    last_name?: string;
    username?: string;
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

export interface InlineKeyboardButton {
    text: string;
    callback_data?: string;
    url?: string;
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}

interface KeyboardButton {
    text: string;
    request_contact?: boolean;
}

interface ReplyKeyboardMarkup {
    keyboard: KeyboardButton[][];
    one_time_keyboard?: boolean;
    resize_keyboard?: boolean;
}

interface ReplyKeyboardRemove {
    remove_keyboard: true;
}

type TelegramReplyMarkup =
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove;
