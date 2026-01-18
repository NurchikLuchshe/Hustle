import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

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
    chat: { id: number };
    text?: string;
}

interface TelegramUpdate {
    message?: TelegramMessage;
}

export async function POST(request: NextRequest) {
    try {
        const update: TelegramUpdate = await request.json();

        if (!update.message?.text) {
            return NextResponse.json({ ok: true });
        }

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text;
        const userId = message.from.id;

        // Handle commands
        if (text.startsWith("/start")) {
            await handleStart(chatId, userId, message.from);
        } else if (text.startsWith("/register")) {
            await handleRegister(chatId, userId, message.from);
        } else if (text.startsWith("/menu")) {
            await showMenu(chatId);
        } else {
            await handleConversation(chatId, userId, text);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

async function handleStart(chatId: number, userId: number, user: any) {
    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("telegram_id", userId.toString())
        .single();

    if (vendor) {
        await sendMessage(
            chatId,
            `👋 С возвращением, ${vendor.business_name}!\n\n` +
            `🔗 Ссылка для записи:\n${process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}\n\n` +
            `Используйте /menu для управления`
        );
    } else {
        await sendMessage(
            chatId,
            `👋 Добро пожаловать в AI-Booking!\n\n` +
            `Я помогу настроить автоматическую запись клиентов.\n\n` +
            `🚀 Нажмите /register для регистрации`
        );
    }
}

async function handleRegister(chatId: number, userId: number, user: any) {
    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("telegram_id", userId.toString())
        .single();

    if (existing) {
        await sendMessage(chatId, "❌ Вы уже зарегистрированы! Используйте /menu");
        return;
    }

    await sendMessage(
        chatId,
        `📝 Регистрация нового бизнеса\n\n` +
        `Как называется ваш бизнес?\n\n` +
        `Например: "Салон красоты Блеск" или "Барбершоп у Ивана"`
    );

    await supabase.from("conversations").upsert({
        platform: "telegram",
        platform_user_id: userId.toString(),
        context: {
            state: "registration_business_name",
            user_info: {
                id: userId,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
            },
        },
    });
}

async function handleConversation(chatId: number, userId: number, text: string) {
    const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("platform_user_id", userId.toString())
        .eq("platform", "telegram")
        .single();

    if (!conversation) {
        await sendMessage(
            chatId,
            "👋 Привет! Нажмите /start для начала или /register для регистрации"
        );
        return;
    }

    const state = conversation.context?.state;

    if (state === "registration_business_name") {
        await handleBusinessName(chatId, userId, text, conversation);
    } else if (state === "registration_slug") {
        await handleSlug(chatId, userId, text, conversation);
    } else if (state === "registration_phone") {
        await handlePhone(chatId, userId, text, conversation);
    }
}

async function handleBusinessName(chatId: number, userId: number, name: string, conv: any) {
    const slug = name
        .toLowerCase()
        .replace(/[^a-zа-я0-9]/gi, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);

    await sendMessage(
        chatId,
        `✅ Отлично! "${name}"\n\n` +
        `Теперь выберите URL:\n\n` +
        `Предлагаю: ${slug}\n\n` +
        `Ссылка будет: ${process.env.NEXT_PUBLIC_APP_URL}/${slug}\n\n` +
        `Напишите свой вариант или "ок" для подтверждения`
    );

    await supabase
        .from("conversations")
        .update({
            context: {
                ...conv.context,
                state: "registration_slug",
                business_name: name,
                suggested_slug: slug,
            },
        })
        .eq("id", conv.id);
}

async function handleSlug(chatId: number, userId: number, input: string, conv: any) {
    const slug =
        input.toLowerCase() === "ок" || input.toLowerCase() === "ok"
            ? conv.context.suggested_slug
            : input.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existing) {
        await sendMessage(chatId, `❌ URL "${slug}" занят. Попробуйте другой:`);
        return;
    }

    await sendMessage(
        chatId,
        `✅ URL: ${slug}\n\n` +
        `Последний шаг - ваш номер телефона:\n\n` +
        `Формат: +7 999 123 45 67`
    );

    await supabase
        .from("conversations")
        .update({
            context: { ...conv.context, state: "registration_phone", slug },
        })
        .eq("id", conv.id);
}

async function handlePhone(chatId: number, userId: number, phone: string, conv: any) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const email = `${conv.context.slug}@temp.aibooking.me`;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
    });

    if (authError || !authData.user) {
        await sendMessage(chatId, `❌ Ошибка создания аккаунта`);
        return;
    }

    // Create vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .insert({
            user_id: authData.user.id,
            telegram_id: userId.toString(),
            business_name: conv.context.business_name,
            slug: conv.context.slug,
            phone,
            email,
            plan: "start",
        })
        .select()
        .single();

    await supabase
        .from("conversations")
        .update({ vendor_id: vendor.id, context: { state: "registered" } })
        .eq("id", conv.id);

    await sendMessage(
        chatId,
        `🎉 Регистрация завершена!\n\n` +
        `✅ Бизнес: ${vendor.business_name}\n` +
        `✅ Ссылка: ${process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}\n\n` +
        `📱 Для входа на сайт:\n` +
        `Email: ${email}\n` +
        `Пароль: ${tempPassword}\n\n` +
        `Сохраните эти данные!\n\n` +
        `Теперь можете добавить услуги через /menu`
    );

    await showMenu(chatId);
}

async function showMenu(chatId: number) {
    await sendMessage(
        chatId,
        `📋 Меню:\n\n` +
        `/register - Регистрация\n` +
        `/menu - Это меню\n\n` +
        `💬 Пишите мне для управления!`
    );
}

async function sendMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });
}
