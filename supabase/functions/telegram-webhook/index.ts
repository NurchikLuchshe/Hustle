import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface TelegramUpdate {
    message?: {
        message_id: number;
        from: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
        };
        chat: {
            id: number;
        };
        text?: string;
    };
    callback_query?: {
        id: string;
        from: {
            id: number;
            first_name: string;
        };
        message: {
            message_id: number;
            chat: {
                id: number;
            };
        };
        data: string;
    };
}

serve(async (req) => {
    try {
        const update: TelegramUpdate = await req.json();

        // Handle callback queries
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            return new Response("OK");
        }

        // Handle messages
        if (!update.message?.text) {
            return new Response("OK");
        }

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text;
        const userId = message.from.id;

        // Commands
        if (text.startsWith("/start")) {
            await handleStart(chatId, userId, message.from);
        } else if (text.startsWith("/register")) {
            await handleRegister(chatId, userId, message.from);
        } else if (text.startsWith("/menu")) {
            await showMenu(chatId);
        } else {
            // AI conversation handler
            await handleConversation(chatId, userId, text);
        }

        return new Response("OK");
    } catch (error) {
        console.error("Error:", error);
        return new Response("Error", { status: 500 });
    }
});

async function handleStart(chatId: number, userId: number, user: any) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user already registered
    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("telegram_id", userId.toString())
        .single();

    if (vendor) {
        await sendMessage(
            chatId,
            `👋 С возвращением, ${vendor.business_name}!\n\n` +
            `Ваш бизнес: ${vendor.business_name}\n` +
            `Ссылка для записи: ${Deno.env.get("APP_URL")}/${vendor.slug}\n\n` +
            `Используйте /menu для управления`
        );
    } else {
        await sendMessage(
            chatId,
            `👋 Добро пожаловать в AI-Booking!\n\n` +
            `Я помогу вам настроить автоматическую запись клиентов.\n\n` +
            `🚀 Для начала зарегистрируйтесь: /register`
        );
    }
}

async function handleRegister(chatId: number, userId: number, user: any) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if already registered
    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("telegram_id", userId.toString())
        .single();

    if (existing) {
        await sendMessage(chatId, "❌ Вы уже зарегистрированы! Используйте /menu");
        return;
    }

    // Start registration flow
    await sendMessage(
        chatId,
        `📝 Регистрация нового бизнеса\n\n` +
        `Давайте познакомимся! Как называется ваш бизнес?\n\n` +
        `Например: "Салон красоты Блеск" или "Барбершоп у Ивана"`
    );

    // Save registration state
    await supabase.from("conversations").upsert({
        vendor_id: null,
        client_id: null,
        platform: "telegram",
        platform_user_id: userId.toString(),
        context: {
            state: "registration_step_1_business_name",
            user_info: {
                id: userId,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
            },
        },
    });
}

async function handleConversation(
    chatId: number,
    userId: number,
    text: string
) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get conversation state
    const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("platform_user_id", userId.toString())
        .eq("platform", "telegram")
        .single();

    if (!conversation) {
        await sendMessage(
            chatId,
            "👋 Привет! Используйте /start для начала или /register для регистрации"
        );
        return;
    }

    const state = conversation.context?.state;

    // Registration flow
    if (state === "registration_step_1_business_name") {
        await handleBusinessNameInput(chatId, userId, text, conversation);
    } else if (state === "registration_step_2_slug") {
        await handleSlugInput(chatId, userId, text, conversation);
    } else if (state === "registration_step_3_phone") {
        await handlePhoneInput(chatId, userId, text, conversation);
    } else {
        // Normal conversation with vendor
        await handleVendorConversation(chatId, userId, text, conversation);
    }
}

async function handleBusinessNameInput(
    chatId: number,
    userId: number,
    businessName: string,
    conversation: any
) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate slug suggestion
    const suggestedSlug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9а-я]/gi, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);

    await sendMessage(
        chatId,
        `✅ Отлично! "${businessName}"\n\n` +
        `Теперь выберите уникальный URL для вашей страницы записи:\n\n` +
        `Предлагаю: ${suggestedSlug}\n\n` +
        `Ваши клиенты будут записываться по ссылке:\n` +
        `${Deno.env.get("APP_URL")}/${suggestedSlug}\n\n` +
        `Отправьте свой вариант или используйте предложенный (просто напишите "ок")`
    );

    // Update conversation state
    await supabase
        .from("conversations")
        .update({
            context: {
                ...conversation.context,
                state: "registration_step_2_slug",
                business_name: businessName,
                suggested_slug: suggestedSlug,
            },
        })
        .eq("id", conversation.id);
}

async function handleSlugInput(
    chatId: number,
    userId: number,
    input: string,
    conversation: any
) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let slug =
        input.toLowerCase() === "ок" || input.toLowerCase() === "ok"
            ? conversation.context.suggested_slug
            : input.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    // Check if slug is available
    const { data: existing } = await supabase
        .from("vendors")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existing) {
        await sendMessage(
            chatId,
            `❌ URL "${slug}" уже занят.\n\Попробуйте другой вариант:`
        );
        return;
    }

    await sendMessage(
        chatId,
        `✅ Отлично! URL: ${slug}\n\n` +
        `Последний шаг - укажите ваш номер телефона для связи с клиентами:\n\n` +
        `Формат: +7 999 123 45 67`
    );

    await supabase
        .from("conversations")
        .update({
            context: {
                ...conversation.context,
                state: "registration_step_3_phone",
                slug: slug,
            },
        })
        .eq("id", conversation.id);
}

async function handlePhoneInput(
    chatId: number,
    userId: number,
    phone: string,
    conversation: any
) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create vendor
    const { data: vendor, error } = await supabase
        .from("vendors")
        .insert({
            telegram_id: userId.toString(),
            business_name: conversation.context.business_name,
            slug: conversation.context.slug,
            phone: phone,
            plan: "start",
            ai_tokens_limit: 10000,
        })
        .select()
        .single();

    if (error) {
        await sendMessage(chatId, `❌ Ошибка: ${error.message}`);
        return;
    }

    // Create temporary password for web login
    const tempPassword = Math.random().toString(36).slice(-8);
    const email = `${conversation.context.slug}@temp.aibooking.local`;

    // Create auth user
    const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
        });

    if (!authError && authData.user) {
        // Update vendor with user_id
        await supabase
            .from("vendors")
            .update({ user_id: authData.user.id, email: email })
            .eq("id", vendor.id);
    }

    // Update conversation
    await supabase
        .from("conversations")
        .update({
            vendor_id: vendor.id,
            context: {
                state: "registered",
            },
        })
        .eq("id", conversation.id);

    await sendMessage(
        chatId,
        `🎉 Регистрация завершена!\n\n` +
        `✅ Бизнес: ${vendor.business_name}\n` +
        `✅ URL: ${Deno.env.get("APP_URL")}/${vendor.slug}\n` +
        `✅ Телефон: ${phone}\n\n` +
        `📱 Данные для входа на сайт:\n` +
        `Email: ${email}\n` +
        `Пароль: ${tempPassword}\n\n` +
        `🚀 Теперь добавьте первую услугу!\n` +
        `Напишите описание в свободной форме, например:\n` +
        `"Мужская стрижка 1500₽, 45 минут"`
    );

    await showMenu(chatId);
}

async function handleVendorConversation(
    chatId: number,
    userId: number,
    text: string,
    conversation: any
) {
    // AI conversation for adding services, etc
    await sendMessage(chatId, "🤖 AI обработка сообщения в разработке...");
}

async function showMenu(chatId: number) {
    await sendMessage(
        chatId,
        `📋 Меню управления:\n\n` +
        `/register - Регистрация нового бизнеса\n` +
        `/menu - Показать это меню\n\n` +
        `💬 Просто пишите мне и я помогу с записями!`
    );
}

async function handleCallbackQuery(callback: any) {
    await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                callback_query_id: callback.id,
                text: "✅",
            }),
        }
    );
}

async function sendMessage(chatId: number, text: string, extra = {}) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "HTML",
            ...extra,
        }),
    });
}
