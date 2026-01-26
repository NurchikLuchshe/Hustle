import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
    sendMessage,
    sendMessageWithKeyboard,
    editMessageText,
    answerCallbackQuery,
    requestContact,
    TelegramUpdate,
    TelegramMessage,
    InlineKeyboardButton,
} from "@/lib/telegram/api";
import {
    getSession,
    updateSession,
    resetSession,
} from "@/lib/telegram/sessions";

// Initialize Supabase with service role for full access
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ===========================================
// Main Webhook Handler
// ===========================================

export async function POST(request: NextRequest) {
    try {
        const update: TelegramUpdate = await request.json();
        console.log("Telegram update:", JSON.stringify(update, null, 2));

        // Handle callback queries (button presses)
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            return NextResponse.json({ ok: true });
        }

        // Handle messages
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const userId = message.from?.id;

            if (!userId) {
                return NextResponse.json({ ok: true });
            }

            // Handle contact sharing
            if (message.contact) {
                await handleContact(chatId, userId, message.contact, message.from);
                return NextResponse.json({ ok: true });
            }

            // Handle text messages
            if (message.text) {
                await handleTextMessage(chatId, userId, message.text, message.from);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true }); // Always return 200 to prevent retries
    }
}

// ===========================================
// Text Message Handler
// ===========================================

async function handleTextMessage(
    chatId: number,
    userId: number,
    text: string,
    user?: { first_name: string; last_name?: string; username?: string }
) {
    const session = getSession(userId);

    // Handle commands
    if (text.startsWith("/")) {
        const parts = text.split(" ");
        const command = parts[0].toLowerCase();
        const arg = parts[1];

        switch (command) {
            case "/start":
                if (arg) {
                    // /start {slug} - client booking flow
                    await handleClientStart(chatId, userId, arg, user);
                } else {
                    // /start - vendor/welcome flow
                    await handleVendorStart(chatId, userId, user?.first_name || "");
                }
                return;
            case "/register":
                await handleRegister(chatId, userId);
                return;
            case "/menu":
                await handleMenu(chatId, userId);
                return;
            case "/book":
                await handleClientStart(chatId, userId, arg, user);
                return;
            case "/ai":
                await handleAIChat(chatId, userId);
                return;
            case "/cancel":
                await handleCancel(chatId, userId);
                return;
            case "/help":
                await handleHelp(chatId);
                return;
            default:
                await sendMessage(chatId, "Неизвестная команда. Используйте /help для справки.");
                return;
        }
    }

    // Handle step-based input
    switch (session.step) {
        case "enter_name":
            await handleNameInput(chatId, userId, text);
            break;
        case "register_business_name":
            await handleBusinessNameInput(chatId, userId, text);
            break;
        case "register_slug":
            await handleSlugInput(chatId, userId, text);
            break;
        case "register_phone":
            await handlePhoneInput(chatId, userId, text);
            break;
        case "ai_chat":
            await handleAIChatMessage(chatId, userId, text);
            break;
        default:
            await sendMessage(
                chatId,
                "Используйте /start для начала или /help для справки."
            );
    }
}

// ===========================================
// Vendor Commands (Registration & Management)
// ===========================================

async function handleVendorStart(chatId: number, userId: number, firstName: string) {
    resetSession(userId);
    const supabase = getSupabase();

    // Check if user is already registered as vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, business_name, slug")
        .eq("telegram_id", userId.toString())
        .single();

    if (vendor) {
        // Existing vendor - show dashboard
        await sendMessage(
            chatId,
            `👋 Привет, ${firstName}!\n\n` +
            `Ваш бизнес: <b>${vendor.business_name}</b>\n` +
            `Ссылка для записи: ${process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}\n\n` +
            `Используйте /menu для управления.`,
            { parseMode: "HTML" }
        );
    } else {
        // New user - show welcome
        await sendMessage(
            chatId,
            `👋 Привет${firstName ? `, ${firstName}` : ""}!\n\n` +
            `Добро пожаловать в AI-Booking!\n\n` +
            `🎯 *Для мастеров:*\n` +
            `/register - Зарегистрировать бизнес\n` +
            `/menu - Панель управления\n\n` +
            `🎯 *Для клиентов:*\n` +
            `/start {slug} - Записаться к мастеру\n` +
            `/ai - Чат с AI-ассистентом\n\n` +
            `📚 /help - Справка`,
            { parseMode: "Markdown" }
        );
    }
}

async function handleRegister(chatId: number, userId: number) {
    const supabase = getSupabase();

    // Check if already registered
    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("telegram_id", userId.toString())
        .single();

    if (existing) {
        await sendMessage(chatId, "Вы уже зарегистрированы! Используйте /menu для управления.");
        return;
    }

    updateSession(userId, { step: "register_business_name" });

    await sendMessage(
        chatId,
        `🏢 *Регистрация бизнеса*\n\n` +
        `Шаг 1/3: Как называется ваш бизнес?\n` +
        `Например: "Салон красоты Лилия" или "Массаж от Марины"`,
        { parseMode: "Markdown" }
    );
}

async function handleBusinessNameInput(chatId: number, userId: number, text: string) {
    if (text.length < 3) {
        await sendMessage(chatId, "Название должно быть не менее 3 символов. Попробуйте ещё:");
        return;
    }

    const suggestedSlug = text
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 30);

    updateSession(userId, {
        step: "register_slug",
        vendorName: text,
    });

    await sendMessage(
        chatId,
        `✅ Отлично!\n\n` +
        `Шаг 2/3: Выберите URL для страницы записи.\n` +
        `Предлагаем: <code>${suggestedSlug}</code>\n\n` +
        `Введите свой вариант или отправьте "да" для подтверждения.`,
        { parseMode: "HTML" }
    );
}

async function handleSlugInput(chatId: number, userId: number, text: string) {
    const session = getSession(userId);

    let slug = text.toLowerCase() === "да" || text.toLowerCase() === "yes"
        ? session.vendorName!
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]+/gi, "-")
            .replace(/(^-|-$)/g, "")
        : text.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");

    slug = slug.substring(0, 30);

    // Check availability
    const supabase = getSupabase();
    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existing) {
        await sendMessage(chatId, `❌ URL "${slug}" уже занят. Попробуйте другой:`);
        return;
    }

    updateSession(userId, {
        step: "register_phone",
        vendorSlug: slug,
    });

    await requestContact(
        chatId,
        `✅ URL "${slug}" доступен!\n\nШаг 3/3: Отправьте номер телефона для связи с клиентами.`
    );
}

async function handlePhoneInput(chatId: number, userId: number, text: string) {
    const phone = text.replace(/[^0-9+]/g, "");

    if (phone.length < 10) {
        await sendMessage(chatId, "Введите корректный номер телефона (минимум 10 цифр):");
        return;
    }

    await completeVendorRegistration(chatId, userId, phone);
}

async function completeVendorRegistration(chatId: number, userId: number, phone: string) {
    const session = getSession(userId);
    const supabase = getSupabase();

    const { error } = await supabase.from("vendors").insert({
        telegram_id: userId.toString(),
        business_name: session.vendorName,
        slug: session.vendorSlug,
        phone,
        plan: "start",
        ai_tokens_limit: 10000,
    });

    if (error) {
        await removeKeyboard(chatId, `❌ Ошибка регистрации: ${error.message}`);
        resetSession(userId);
        return;
    }

    await removeKeyboard(
        chatId,
        `🎉 *Регистрация завершена!*\n\n` +
        `Ваш бизнес: ${session.vendorName}\n` +
        `Ссылка для записи:\n` +
        `${process.env.NEXT_PUBLIC_APP_URL}/${session.vendorSlug}\n\n` +
        `*Следующие шаги:*\n` +
        `1. Добавьте услуги в веб-панели\n` +
        `2. Настройте график работы\n` +
        `3. Поделитесь ссылкой с клиентами\n\n` +
        `Используйте /menu для управления.`,
        { parseMode: "Markdown" }
    );

    resetSession(userId);
}

async function handleMenu(chatId: number, userId: number) {
    const supabase = getSupabase();

    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, business_name, slug")
        .eq("telegram_id", userId.toString())
        .single();

    if (!vendor) {
        await sendMessage(chatId, "❌ Вы не зарегистрированы.\n\nИспользуйте /register");
        return;
    }

    const keyboard: InlineKeyboardButton[][] = [
        [
            { text: "🌐 Открыть панель", url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
        ],
        [
            { text: "📋 Моя ссылка", callback_data: "menu_link" },
            { text: "📊 Статистика", callback_data: "menu_stats" },
        ],
    ];

    await sendMessageWithKeyboard(
        chatId,
        `📱 *Меню управления*\n\nБизнес: ${vendor.business_name}`,
        keyboard,
        "Markdown"
    );
}

// ===========================================
// Client Booking Commands
// ===========================================

async function handleClientStart(
    chatId: number,
    userId: number,
    slug?: string,
    user?: { first_name: string; last_name?: string }
) {
    resetSession(userId);

    if (!slug) {
        await sendMessage(chatId, "Укажите мастера: /start {slug}\nНапример: /start maria_beauty");
        return;
    }

    const supabase = getSupabase();
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, business_name, slug, description")
        .eq("slug", slug)
        .single();

    if (!vendor) {
        await sendMessage(chatId, `❌ Мастер с URL "${slug}" не найден.\n\nПроверьте правильность ссылки.`);
        return;
    }

    updateSession(userId, {
        step: "select_service",
        vendorId: vendor.id,
        vendorSlug: vendor.slug,
        vendorName: vendor.business_name,
    });

    await showServices(chatId, userId, vendor.id, vendor.business_name);
}

async function handleCancel(chatId: number, userId: number) {
    resetSession(userId);
    await removeKeyboard(chatId, "❌ Действие отменено.\n\nИспользуйте /start для начала.");
}

async function handleHelp(chatId: number) {
    const helpText = `📚 *Справка по боту*

*Для мастеров:*
/register - Зарегистрировать бизнес
/menu - Панель управления

*Для клиентов:*
/start {slug} - Записаться к мастеру
/book {slug} - Альтернатива записи
/ai - Чат с AI-ассистентом (скоро)

*Общие:*
/cancel - Отменить действие
/help - Эта справка

*Пример записи:*
/start maria\\_beauty`;

    await sendMessage(chatId, helpText, { parseMode: "Markdown" });
}

// ===========================================
// Service Selection
// ===========================================

async function showServices(
    chatId: number,
    userId: number,
    vendorId: string,
    vendorName: string
) {
    const supabase = getSupabase();

    const { data: services } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes")
        .eq("vendor_id", vendorId)
        .eq("is_active", true)
        .order("name");

    if (!services || services.length === 0) {
        await sendMessage(chatId, `У мастера ${vendorName} пока нет доступных услуг.`);
        resetSession(userId);
        return;
    }

    const keyboard: InlineKeyboardButton[][] = services.map((s) => [
        {
            text: `${s.name} - ${s.price}₽ (${s.duration_minutes} мин)`,
            callback_data: `service:${s.id}`,
        },
    ]);
    keyboard.push([{ text: "❌ Отмена", callback_data: "cancel" }]);

    const msg = await sendMessageWithKeyboard(
        chatId,
        `💇 *${vendorName}*\n\nВыберите услугу:`,
        keyboard,
        "Markdown"
    );
    updateSession(userId, { messageId: msg.message_id });
}

// ===========================================
// Date Selection
// ===========================================

async function showDateSelection(chatId: number, userId: number, messageId?: number) {
    const session = getSession(userId);
    const dates: InlineKeyboardButton[][] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dateStr = date.toISOString().split("T")[0];
        const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        const monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

        dates.push([{
            text: `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`,
            callback_data: `date:${dateStr}`,
        }]);
    }

    dates.push([{ text: "⬅️ Назад", callback_data: "back_to_services" }]);
    dates.push([{ text: "❌ Отмена", callback_data: "cancel" }]);

    const text = `📅 *Выбор даты*\n\nУслуга: ${session.serviceName}\nСтоимость: ${session.servicePrice}₽\n\nВыберите дату:`;

    if (messageId) {
        await editMessageText(chatId, messageId, text, {
            parseMode: "Markdown",
            replyMarkup: { inline_keyboard: dates },
        });
    } else {
        const msg = await sendMessageWithKeyboard(chatId, text, dates, "Markdown");
        updateSession(userId, { messageId: msg.message_id });
    }
}

// ===========================================
// Time Selection
// ===========================================

async function showTimeSelection(chatId: number, userId: number, messageId?: number) {
    const session = getSession(userId);

    if (!session.vendorId || !session.date || !session.serviceDuration) {
        await sendMessage(chatId, "Ошибка сессии. Начните заново: /cancel");
        return;
    }

    const supabase = getSupabase();
    const selectedDate = new Date(session.date);
    const dayOfWeek = selectedDate.getDay();

    const { data: schedule } = await supabase
        .from("work_schedules")
        .select("start_time, end_time")
        .eq("vendor_id", session.vendorId)
        .eq("day_of_week", dayOfWeek)
        .single();

    if (!schedule) {
        const kb: InlineKeyboardButton[][] = [[{ text: "⬅️ Другая дата", callback_data: "back_to_dates" }]];
        await editMessageText(chatId, messageId!, "❌ Мастер не работает в этот день.", {
            replyMarkup: { inline_keyboard: kb },
        });
        return;
    }

    const { data: bookings } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("vendor_id", session.vendorId)
        .gte("start_time", `${session.date}T00:00:00`)
        .lt("start_time", `${session.date}T23:59:59`)
        .in("status", ["confirmed", "pending"]);

    const slots = generateTimeSlots(
        schedule.start_time,
        schedule.end_time,
        session.date,
        session.serviceDuration,
        bookings || []
    );

    if (slots.length === 0) {
        const kb: InlineKeyboardButton[][] = [[{ text: "⬅️ Другая дата", callback_data: "back_to_dates" }]];
        await editMessageText(chatId, messageId!, "❌ Нет свободных слотов на эту дату.", {
            replyMarkup: { inline_keyboard: kb },
        });
        return;
    }

    const keyboard: InlineKeyboardButton[][] = [];
    for (let i = 0; i < slots.length; i += 3) {
        const row: InlineKeyboardButton[] = [];
        for (let j = i; j < Math.min(i + 3, slots.length); j++) {
            row.push({ text: slots[j], callback_data: `time:${slots[j]}` });
        }
        keyboard.push(row);
    }
    keyboard.push([{ text: "⬅️ Назад", callback_data: "back_to_dates" }]);
    keyboard.push([{ text: "❌ Отмена", callback_data: "cancel" }]);

    const text = `🕐 *Выбор времени*\n\nУслуга: ${session.serviceName}\nДата: ${formatDate(session.date)}\n\nВыберите время:`;

    await editMessageText(chatId, messageId!, text, {
        parseMode: "Markdown",
        replyMarkup: { inline_keyboard: keyboard },
    });
}

function generateTimeSlots(
    startTime: string,
    endTime: string,
    date: string,
    duration: number,
    bookings: { start_time: string; end_time: string }[]
): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
        const slotDate = new Date(`${date}T${timeSlot}:00`);
        const slotEndDate = new Date(slotDate.getTime() + duration * 60000);

        const isAvailable = !bookings.some((b) => {
            const bs = new Date(b.start_time);
            const be = new Date(b.end_time);
            return (slotDate >= bs && slotDate < be) ||
                   (slotEndDate > bs && slotEndDate <= be) ||
                   (slotDate <= bs && slotEndDate >= be);
        });

        const slotEndHour = slotEndDate.getHours();
        const slotEndMinute = slotEndDate.getMinutes();
        const withinWorkHours = slotEndHour < endHour || (slotEndHour === endHour && slotEndMinute <= endMinute);

        const now = new Date();
        const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const isInFuture = slotDate >= minTime;

        if (isAvailable && withinWorkHours && isInFuture) {
            slots.push(timeSlot);
        }

        currentMinute += 60;
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
        }
    }

    return slots;
}

// ===========================================
// Contact & Name Collection
// ===========================================

async function askForName(chatId: number, userId: number, messageId?: number) {
    const session = getSession(userId);

    const text = `✅ *Почти готово!*\n\nУслуга: ${session.serviceName}\nДата: ${formatDate(session.date!)}\nВремя: ${session.time}\nСтоимость: ${session.servicePrice}₽\n\nВведите ваше имя:`;

    updateSession(userId, { step: "enter_name" });

    if (messageId) {
        await editMessageText(chatId, messageId, text, { parseMode: "Markdown" });
    } else {
        await sendMessage(chatId, text, { parseMode: "Markdown" });
    }
}

async function handleNameInput(chatId: number, userId: number, name: string) {
    if (name.length < 2) {
        await sendMessage(chatId, "Введите корректное имя (минимум 2 символа):");
        return;
    }

    updateSession(userId, { step: "enter_phone", clientName: name });

    await requestContact(
        chatId,
        `👤 Отлично, ${name}!\n\nОтправьте номер телефона для подтверждения записи:`
    );
}

async function handleContact(
    chatId: number,
    userId: number,
    contact: { phone_number: string; first_name: string },
    user?: { first_name: string }
) {
    const session = getSession(userId);

    // Handle vendor registration phone
    if (session.step === "register_phone") {
        await completeVendorRegistration(chatId, userId, contact.phone_number);
        return;
    }

    // Handle client booking phone
    if (session.step !== "enter_phone") {
        await removeKeyboard(chatId, "Сначала выберите услугу и время.");
        return;
    }

    const phone = contact.phone_number.replace(/\D/g, "");

    updateSession(userId, {
        step: "confirm",
        clientPhone: phone,
        clientName: session.clientName || contact.first_name || user?.first_name,
    });

    await createBooking(chatId, userId);
}

// ===========================================
// Booking Creation
// ===========================================

async function createBooking(chatId: number, userId: number) {
    const session = getSession(userId);

    if (!session.vendorId || !session.serviceId || !session.date || !session.time || !session.clientName || !session.clientPhone) {
        await removeKeyboard(chatId, "❌ Ошибка данных. Начните заново: /cancel");
        return;
    }

    const supabase = getSupabase();

    try {
        // Find or create client
        let clientId: string;
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", session.clientPhone)
            .eq("vendor_id", session.vendorId)
            .single();

        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({
                    vendor_id: session.vendorId,
                    name: session.clientName,
                    phone: session.clientPhone,
                    telegram_id: userId,
                })
                .select("id")
                .single();

            if (clientError) throw clientError;
            clientId = newClient.id;
        }

        // Calculate times
        const startTime = `${session.date}T${session.time}:00`;
        const endDate = new Date(startTime);
        endDate.setMinutes(endDate.getMinutes() + session.serviceDuration!);
        const endTime = endDate.toISOString();

        // Final conflict check
        const { data: conflicts } = await supabase
            .from("bookings")
            .select("id")
            .eq("vendor_id", session.vendorId)
            .gte("start_time", startTime)
            .lt("start_time", endTime)
            .in("status", ["confirmed", "pending"]);

        if (conflicts && conflicts.length > 0) {
            await removeKeyboard(chatId, `❌ Время уже занято. Попробуйте другое.\n\n/start ${session.vendorSlug}`);
            resetSession(userId);
            return;
        }

        // Create booking
        const { error: bookingError } = await supabase.from("bookings").insert({
            vendor_id: session.vendorId,
            client_id: clientId,
            service_id: session.serviceId,
            start_time: startTime,
            end_time: endTime,
            status: "confirmed",
            source: "telegram",
        });

        if (bookingError) throw bookingError;

        // Get vendor info
        const { data: vendor } = await supabase
            .from("vendors")
            .select("business_name, phone")
            .eq("id", session.vendorId)
            .single();

        const confirmationText = `✅ *Запись подтверждена!*

📋 *Детали:*
👤 Мастер: ${vendor?.business_name || session.vendorName}
💇 Услуга: ${session.serviceName}
📅 Дата: ${formatDate(session.date)}
🕐 Время: ${session.time}
💰 Стоимость: ${session.servicePrice}₽

📞 Контакт: ${vendor?.phone || "уточните у мастера"}

⏰ Приходите вовремя!

Новая запись: /start ${session.vendorSlug}`;

        await removeKeyboard(chatId, confirmationText, { parseMode: "Markdown" });
        resetSession(userId);
    } catch (error) {
        console.error("Booking error:", error);
        await removeKeyboard(chatId, "❌ Ошибка создания записи. Попробуйте позже.");
        resetSession(userId);
    }
}

// ===========================================
// Callback Query Handler
// ===========================================

async function handleCallbackQuery(query: {
    id: string;
    from: { id: number };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
}) {
    const userId = query.from.id;
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const data = query.data;

    if (!chatId || !data) {
        await answerCallbackQuery(query.id);
        return;
    }

    await answerCallbackQuery(query.id);

    const session = getSession(userId);
    const [action, value] = data.split(":");

    switch (action) {
        case "service":
            await handleServiceSelection(chatId, userId, value, messageId);
            break;
        case "date":
            updateSession(userId, { step: "select_time", date: value });
            await showTimeSelection(chatId, userId, messageId);
            break;
        case "time":
            updateSession(userId, { time: value });
            await askForName(chatId, userId, messageId);
            break;
        case "back_to_services":
            updateSession(userId, { step: "select_service" });
            await showServices(chatId, userId, session.vendorId!, session.vendorName!);
            break;
        case "back_to_dates":
            updateSession(userId, { step: "select_date" });
            await showDateSelection(chatId, userId, messageId);
            break;
        case "cancel":
            resetSession(userId);
            await editMessageText(chatId, messageId!, "❌ Действие отменено.\n\n/start - начать заново");
            break;
        case "menu_link":
            await sendMessage(chatId, `🔗 Ваша ссылка для записи:\n${process.env.NEXT_PUBLIC_APP_URL}/${session.vendorSlug || "..."}`);
            break;
        case "menu_stats":
            await sendMessage(chatId, "📊 Статистика доступна в веб-панели.");
            break;
        case "ai_chat":
            await handleAIChat(chatId, userId);
            break;
    }
}

async function handleServiceSelection(chatId: number, userId: number, serviceId: string, messageId?: number) {
    const supabase = getSupabase();

    const { data: service } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes")
        .eq("id", serviceId)
        .single();

    if (!service) {
        await sendMessage(chatId, "Услуга не найдена. Попробуйте снова.");
        return;
    }

    updateSession(userId, {
        step: "select_date",
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration_minutes,
    });

    await showDateSelection(chatId, userId, messageId);
}

// ===========================================
// AI Chat (Placeholder)
// ===========================================

async function handleAIChat(chatId: number, userId: number) {
    updateSession(userId, { step: "ai_chat" });

    await sendMessage(
        chatId,
        `🤖 *AI-Ассистент* (в разработке)

Скоро вы сможете просто написать:
"Запиши меня на стрижку к Марии на завтра"

И AI поможет оформить запись!

Пока используйте: /start {slug}
Выход: /cancel`,
        { parseMode: "Markdown" }
    );
}

async function handleAIChatMessage(chatId: number, userId: number, text: string) {
    await sendMessage(
        chatId,
        `🤖 AI-ассистент в разработке.\n\nВы написали: "${text}"\n\nДля записи: /start {slug}\nВыход: /cancel`
    );
}

// ===========================================
// Utility Functions
// ===========================================

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
    const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return `${date.getDate()} ${months[date.getMonth()]} (${days[date.getDay()]})`;
}

// Override removeKeyboard to support parseMode
async function removeKeyboard(
    chatId: number,
    text: string,
    options?: { parseMode?: "Markdown" | "HTML" }
): Promise<TelegramMessage> {
    return sendMessage(chatId, text, {
        parseMode: options?.parseMode,
        replyMarkup: { remove_keyboard: true },
    });
}
