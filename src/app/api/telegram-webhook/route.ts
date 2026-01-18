import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log("✅ Webhook received!");

        const update = await request.json();
        console.log("Update:", JSON.stringify(update));

        if (!update.message?.text) {
            console.log("No text message");
            return NextResponse.json({ ok: true });
        }

        const chatId = update.message.chat.id;
        const text = update.message.text;

        console.log(`Message from ${chatId}: ${text}`);

        if (text.startsWith("/start")) {
            await sendTelegramMessage(chatId, "👋 Привет! Бот работает!");
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

async function sendTelegramMessage(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    console.log(`Sending to ${chatId}: ${text}`);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });

    console.log("Telegram API response:", await response.text());
}
