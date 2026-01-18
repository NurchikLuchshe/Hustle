import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
    try {
        const update = await request.json();

        if (!update.message?.text) {
            return NextResponse.json({ ok: true });
        }

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text;
        const userId = message.from.id;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (text.startsWith("/start")) {
            const { data: vendor } = await supabase
                .from("vendors")
                .select("*")
                .eq("telegram_id", userId.toString())
                .single();

            if (vendor) {
                await sendTelegramMessage(
                    chatId,
                    `👋 С возвращением, ${vendor.business_name}!\n\n🔗 Ссылка: ${process.env.NEXT_PUBLIC_APP_URL}/${vendor.slug}\n\nИспользуйте /menu`
                );
            } else {
                await sendTelegramMessage(
                    chatId,
                    `👋 Добро пожаловать в AI-Booking!\n\nЯ помогу настроить автоматическую запись.\n\n🚀 Нажмите /register для регистрации`
                );
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

async function sendTelegramMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });
}
