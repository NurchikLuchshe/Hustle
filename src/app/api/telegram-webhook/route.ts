import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();
        console.log("Telegram update:", update);

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";

            let reply = "👋 Привет! Я AI-помощник для записи на услуги. Напишите что вам нужно!";

            if (text !== "/start") {
                // Call OpenAI
                try {
                    const aiResponse = await fetch(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${OPENAI_API_KEY}`,
                            },
                            body: JSON.stringify({
                                model: "gpt-4",
                                messages: [
                                    {
                                        role: "system",
                                        content:
                                            "Ты - вежливый помощник для записи клиентов на услуги. Будь дружелюбным, используй эмодзи. Помогай клиентам выбрать услугу и записаться.",
                                    },
                                    { role: "user", content: text },
                                ],
                                temperature: 0.7,
                                max_tokens: 300,
                            }),
                        }
                    );

                    const data = await aiResponse.json();
                    reply = data.choices?.[0]?.message?.content || "Извините, не понял вас. Попробуйте переформулировать.";
                } catch (error) {
                    console.error("OpenAI error:", error);
                    reply = "Произошла ошибка при обработке запроса. Попробуйте позже.";
                }
            }

            // Send message to Telegram
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: reply,
                }),
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { ok: false, error: String(error) },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({ status: "ok", bot: "telegram-webhook" });
}
