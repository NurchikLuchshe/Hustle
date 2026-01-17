// Ultra-minimal Telegram Bot - NO IMPORTS VERSION
// This should work without any auth issues

Deno.serve(async (req) => {
    // Allow all origins
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
        const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") || "";

        const update = await req.json();
        console.log("Received:", JSON.stringify(update, null, 2));

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";

            let reply = "👋 Привет! Я AI-помощник для записи.";

            if (text !== "/start") {
                // Call OpenAI
                try {
                    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${OPENAI_KEY}`,
                        },
                        body: JSON.stringify({
                            model: "gpt-4",
                            messages: [
                                { role: "system", content: "Ты - помощник для записи. Будь вежлив." },
                                { role: "user", content: text }
                            ],
                            max_tokens: 200,
                        }),
                    });

                    const data = await aiRes.json();
                    reply = data.choices?.[0]?.message?.content || "Не понял вас.";
                } catch (e) {
                    reply = "Ошибка AI. Попробуйте позже.";
                    console.error("OpenAI error:", e);
                }
            }

            // Send message
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: reply }),
            });
        }

        return new Response(JSON.stringify({ ok: true }), { headers });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ ok: false, error: String(error) }),
            { status: 500, headers }
        );
    }
});
