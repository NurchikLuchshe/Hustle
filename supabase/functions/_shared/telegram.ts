/**
 * Telegram Bot API helpers
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

/**
 * Get bot token from environment
 */
export function getBotToken(): string {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }
  return token;
}

/**
 * Make request to Telegram API
 */
async function telegramRequest<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_BASE}${token}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}

/**
 * Send text message
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    replyMarkup?: TelegramReplyMarkup;
    disableNotification?: boolean;
  }
): Promise<TelegramMessage> {
  return telegramRequest<TelegramMessage>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode,
    reply_markup: options?.replyMarkup,
    disable_notification: options?.disableNotification,
  });
}

/**
 * Send message with inline keyboard
 */
export async function sendMessageWithKeyboard(
  chatId: number | string,
  text: string,
  keyboard: InlineKeyboardButton[][]
): Promise<TelegramMessage> {
  return sendMessage(chatId, text, {
    replyMarkup: {
      inline_keyboard: keyboard,
    },
  });
}

/**
 * Send contact request button
 */
export async function requestContact(
  chatId: number | string,
  text: string
): Promise<TelegramMessage> {
  return sendMessage(chatId, text, {
    replyMarkup: {
      keyboard: [
        [
          {
            text: "Поделиться номером",
            request_contact: true,
          },
        ],
      ],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
}

/**
 * Remove custom keyboard
 */
export async function removeKeyboard(
  chatId: number | string,
  text: string
): Promise<TelegramMessage> {
  return sendMessage(chatId, text, {
    replyMarkup: {
      remove_keyboard: true,
    },
  });
}

/**
 * Answer callback query (acknowledge button press)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  options?: {
    text?: string;
    showAlert?: boolean;
  }
): Promise<boolean> {
  return telegramRequest<boolean>("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: options?.text,
    show_alert: options?.showAlert,
  });
}

/**
 * Edit message text
 */
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

/**
 * Get file download URL
 */
export async function getFileUrl(fileId: string): Promise<string> {
  const token = getBotToken();
  const file = await telegramRequest<{ file_path: string }>("getFile", {
    file_id: fileId,
  });
  return `https://api.telegram.org/file/bot${token}/${file.file_path}`;
}

/**
 * Download file as buffer
 */
export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  const url = await getFileUrl(fileId);
  const response = await fetch(url);
  return response.arrayBuffer();
}

// ===========================================
// Types
// ===========================================

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
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

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface KeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  one_time_keyboard?: boolean;
  resize_keyboard?: boolean;
}

export interface ReplyKeyboardRemove {
  remove_keyboard: true;
}

export type TelegramReplyMarkup =
  | InlineKeyboardMarkup
  | ReplyKeyboardMarkup
  | ReplyKeyboardRemove;

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  business_message?: TelegramMessage;
  business_connection?: TelegramBusinessConnection;
}
