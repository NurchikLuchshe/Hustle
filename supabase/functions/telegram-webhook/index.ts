import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

serve(async (req) => {
  try {
    const update = await req.json();
    console.log("Received update:", JSON.stringify(update));

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || "";

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Handle /start command
      if (text.startsWith("/start")) {
        await sendMessage(
          chatId,
          "👋 Привет! Я AI-помощник для записи на услуги.\n\n" +
          "Просто напишите что вам нужно, и я помогу вам записаться!"
        );
        return new Response("OK");
      }

      // Get or create conversation
      let conversation = await getConversation(supabase, chatId);
      if (!conversation) {
        const { data: vendor } = await supabase
          .from("vendors")
          .select("id")
          .limit(1)
          .single();

        if (!vendor) {
          await sendMessage(chatId, "Извините, произошла ошибка. Попробуйте позже.");
          return new Response("OK");
        }

        conversation = await createConversation(supabase, chatId, vendor.id);
      }

      // Get services
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("vendor_id", conversation.vendor_id)
        .eq("is_active", true);

      const servicesText = services
        ?.map((s: any) => `- ${s.name} (${s.price}₽, ${s.duration_minutes} мин)`)
        .join("\n");

      // Call OpenAI
      const aiResponse = await callOpenAI(
        conversation.state.messages || [],
        text,
        servicesText || "Услуги загружаются..."
      );

      // Update conversation
      await updateConversation(supabase, chatId, {
        messages: [
          ...(conversation.state.messages || []),
          { role: "user", content: text },
          { role: "assistant", content: aiResponse },
        ],
      });

      await sendMessage(chatId, aiResponse);
    }

    return new Response("OK");
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error", { status: 500 });
  }
});

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}

async function callOpenAI(
  history: any[],
  userMessage: string,
  servicesText: string
): Promise<string> {
  const systemPrompt = `Ты - вежливый ассистент для записи клиентов на услуги.

Доступные услуги:
${servicesText}

Твоя задача:
1. Поприветствовать клиента
2. Понять какая услуга ему нужна
3. Предложить записаться (попросить выбрать дату и время)
4. Узнать имя и телефон
5. Подтвердить запись

Будь вежливым и помогай клиенту сделать выбор. Используй эмодзи.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getConversation(supabase: any, chatId: number) {
  const { data } = await supabase
    .from("bot_conversations")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .single();
  return data;
}

async function createConversation(
  supabase: any,
  chatId: number,
  vendorId: string
) {
  const { data } = await supabase
    .from("bot_conversations")
    .insert({
      telegram_chat_id: chatId,
      vendor_id: vendorId,
      state: { messages: [] },
    })
    .select()
    .single();
  return data;
}

async function updateConversation(supabase: any, chatId: number, state: any) {
  await supabase
    .from("bot_conversations")
    .update({ state, updated_at: new Date().toISOString() })
    .eq("telegram_chat_id", chatId);
}
