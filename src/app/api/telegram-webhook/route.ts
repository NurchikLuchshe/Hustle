import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TelegramMessage {
    message_id: number;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
    };
    chat: {
        id: number;
        type: string;
    };
    text?: string;
    date: number;
}

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

// Send message to Telegram
async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const body: any = {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
    };

    if (replyMarkup) {
        body.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return response.json();
}

// Handle /start command
async function handleStart(chatId: number, userId: number, firstName: string) {
    // Check if user already registered as vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, business_name, slug")
        .eq("telegram_id", userId.toString())
        .single();

    if (vendor) {
        await sendMessage(
            chatId,
            `👋 Привет, ${firstName}!\n\n` +
            `Ваш бизнес: <b>${vendor.business_name}</b>\n` +
            `Ссылка для записи: ${process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}\n\n` +
            `Используйте /menu для управления.`,
            {
                keyboard: [
                    [{ text: "📅 Календарь" }, { text: "👥 Клиенты" }],
                    [{ text: "⚙️ Настройки" }, { text: "📊 Статистика" }],
                ],
                resize_keyboard: true,
            }
        );
    } else {
        await sendMessage(
            chatId,
            `👋 Привет, ${firstName}!\n\n` +
            `Добро пожаловать в AI-Booking - умный помощник для записи клиентов.\n\n` +
            `🎯 Что я умею:\n` +
            `• Принимать записи от клиентов\n` +
            `• Управлять расписанием\n` +
            `• Отправлять напоминания\n` +
            `• Собирать статистику\n\n` +
            `Для начала работы используйте /register`,
            {
                keyboard: [[{ text: "/register Зарегистрироваться" }]],
                resize_keyboard: true,
            }
        );
    }
}

// Handle /register command
async function handleRegister(chatId: number, userId: number, firstName: string) {
    // Save conversation state
    await supabase.from("conversations").upsert({
        telegram_user_id: userId.toString(),
        context: {
            command: "register",
            step: "business_name",
        },
        platform: "telegram",
    });

    await sendMessage(
        chatId,
        `🏢 Регистрация нового бизнеса\n\n` +
        `Шаг 1/3: Как называется ваш бизнес?\n` +
        `Например: "Салон красоты Лилия" или "Массаж от Марины"`
    );
}

// Handle /menu command  
async function handleMenu(chatId: number, userId: number) {
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, business_name")
        .eq("telegram_id", userId.toString())
        .single();

    if (!vendor) {
        await sendMessage(
            chatId,
            `❌ Вы не зарегистрированы.\n\nИспользуйте /register`
        );
        return;
    }

    await sendMessage(
        chatId,
        `📱 <b>Меню управления</b>\n\n` +
        `Выберите действие:`,
        {
            inline_keyboard: [
                [
                    { text: "📅 Календарь", callback_data: "menu_calendar" },
                    { text: "👥 Клиенты", callback_data: "menu_clients" },
                ],
                [
                    { text: "⚙️ Настройки", callback_data: "menu_settings" },
                    { text: "📊 Статистика", callback_data: "menu_stats" },
                ],
            ],
        }
    );
}

// Handle registration flow
async function handleRegistrationFlow(
    chatId: number,
    userId: number,
    text: string
) {
    const { data: conversation } = await supabase
        .from("conversations")
        .select("context")
        .eq("telegram_user_id", userId.toString())
        .single();

    if (!conversation?.context) return;

    const context = conversation.context as any;

    if (context.step === "business_name") {
        // Save business name, ask for slug
        await supabase
            .from("conversations")
            .update({
                context: {
                    ...context,
                    step: "slug",
                    business_name: text,
                },
            })
            .eq("telegram_user_id", userId.toString());

        const suggestedSlug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        await sendMessage(
            chatId,
            `✅ Отлично!\n\n` +
            `Шаг 2/3: Выберите уникальный URL для записи клиентов.\n` +
            `Предлагаем: <code>${suggestedSlug}</code>\n\n` +
            `Можете ввести свой вариант или отправить "да" для подтверждения.`
        );
    } else if (context.step === "slug") {
        const slug =
            text.toLowerCase() === "да" || text.toLowerCase() === "yes"
                ? context.business_name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                : text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Check if slug is available
        const { data: existing } = await supabase
            .from("vendors")
            .select("id")
            .eq("slug", slug)
            .single();

        if (existing) {
            await sendMessage(
                chatId,
                `❌ URL "${slug}" уже занят.\n\nПопробуйте другой вариант:`
            );
            return;
        }

        // Save slug, ask for phone
        await supabase
            .from("conversations")
            .update({
                context: {
                    ...context,
                    step: "phone",
                    slug,
                },
            })
            .eq("telegram_user_id", userId.toString());

        await sendMessage(
            chatId,
            `✅ URL доступен!\n\n` +
            `Шаг 3/3: Укажите ваш номер телефона для связи с клиентами.\n` +
            `Например: +79001234567`,
            {
                keyboard: [
                    [
                        {
                            text: "📱 Отправить мой номер",
                            request_contact: true,
                        },
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        );
    } else if (context.step === "phone") {
        const phone = text.replace(/[^0-9+]/g, "");

        // Create vendor
        const { data: vendor, error } = await supabase
            .from("vendors")
            .insert({
                telegram_id: userId.toString(),
                business_name: context.business_name,
                slug: context.slug,
                phone,
                plan: "start",
                ai_tokens_limit: 10000,
            })
            .select()
            .single();

        if (error) {
            await sendMessage(
                chatId,
                `❌ Ошибка создания профиля: ${error.message}`
            );
            return;
        }

        // Clear conversation
        await supabase
            .from("conversations")
            .delete()
            .eq("telegram_user_id", userId.toString());

        await sendMessage(
            chatId,
            `🎉 <b>Регистрация завершена!</b>\n\n` +
            `Ваш бизнес: ${context.business_name}\n` +
            `Ссылка для записи:\n` +
            `${process.env.NEXT_PUBLIC_APP_URL}/${context.slug}\n\n` +
            `Теперь вы можете:\n` +
            `• Добавить услуги в веб-панели\n` +
            `• Настроить рабочий график\n` +
            `• Получать записи от клиентов\n\n` +
            `Используйте /menu для управления.`,
            {
                keyboard: [
                    [{ text: "📅 Календарь" }, { text: "👥 Клиенты" }],
                    [{ text: "⚙️ Настройки" }, { text: "📊 Статистика" }],
                ],
                resize_keyboard: true,
            }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify webhook secret
        const secretToken = request.headers.get("x-telegram-bot-api-secret-token");

        if (secretToken !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const update: TelegramUpdate = await request.json();
        const message = update.message;

        if (!message || !message.text) {
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id;
        const userId = message.from.id;
        const text = message.text;
        const firstName = message.from.first_name;

        // Handle commands
        if (text.startsWith("/")) {
            const command = text.split(" ")[0].toLowerCase();

            switch (command) {
                case "/start":
                    await handleStart(chatId, userId, firstName);
                    break;
                case "/register":
                    await handleRegister(chatId, userId, firstName);
                    break;
                case "/menu":
                    await handleMenu(chatId, userId);
                    break;
                default:
                    await sendMessage(
                        chatId,
                        "❓ Неизвестная команда.\n\nДоступные команды:\n/start - Главное меню\n/register - Регистрация\n/menu - Управление"
                    );
            }
        } else {
            // Handle conversation flow
            await handleRegistrationFlow(chatId, userId, text);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
