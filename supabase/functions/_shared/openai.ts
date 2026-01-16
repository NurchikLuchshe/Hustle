/**
 * OpenAI Client for Edge Functions
 */

import OpenAI from "https://esm.sh/openai@4";

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client (singleton)
 */
export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY")!,
    });
  }
  return openaiClient;
}

/**
 * AI Tools (Function Calling) definitions
 */
export const AI_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_services",
      description:
        "Получить список услуг с ценами и описанием. Используй когда клиент спрашивает о ценах или какие услуги есть.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Категория услуг для фильтрации (опционально)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description:
        "Проверить свободные слоты для записи на конкретную услугу и дату. ОБЯЗАТЕЛЬНО вызывай перед предложением времени клиенту.",
      parameters: {
        type: "object",
        properties: {
          service_id: {
            type: "string",
            description: "UUID услуги",
          },
          date: {
            type: "string",
            description: "Дата в формате YYYY-MM-DD",
          },
          time_preference: {
            type: "string",
            enum: ["morning", "afternoon", "evening", "any"],
            description: "Предпочтительное время дня",
          },
        },
        required: ["service_id", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Создать новое бронирование. Вызывай только после подтверждения времени клиентом и получения телефона.",
      parameters: {
        type: "object",
        properties: {
          service_id: {
            type: "string",
            description: "UUID услуги",
          },
          datetime: {
            type: "string",
            description: "Дата и время в формате ISO 8601",
          },
          client_phone: {
            type: "string",
            description: "Телефон клиента в формате +7XXXXXXXXXX",
          },
          client_name: {
            type: "string",
            description: "Имя клиента (опционально)",
          },
        },
        required: ["service_id", "datetime", "client_phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_info",
      description: "Получить информацию о записях клиента по телефону или telegram_id",
      parameters: {
        type: "object",
        properties: {
          telegram_id: {
            type: "number",
            description: "Telegram ID клиента",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Отменить существующую запись",
      parameters: {
        type: "object",
        properties: {
          booking_id: {
            type: "string",
            description: "UUID бронирования",
          },
          reason: {
            type: "string",
            description: "Причина отмены",
          },
        },
        required: ["booking_id"],
      },
    },
  },
];

/**
 * Build system prompt for AI
 */
export function buildSystemPrompt(vendor: {
  business_name: string;
  timezone: string;
  currency: string;
  ai_config: {
    personality: string;
    language: string;
    custom_instructions?: string;
  };
  services?: Array<{ name: string; price: number; duration_minutes: number }>;
}): string {
  const now = new Date().toLocaleString("ru-RU", { timeZone: vendor.timezone });

  const personalityInstructions = {
    formal: "Обращайся на 'Вы', используй формальный тон.",
    friendly: "Обращайся на 'ты', будь дружелюбным и неформальным.",
    neutral: "Используй нейтральный, деловой тон.",
  };

  const servicesList = vendor.services
    ?.map((s) => `- ${s.name}: ${s.price}₽ (${s.duration_minutes} мин)`)
    .join("\n") || "Услуги не настроены";

  return `
Ты — интеллектуальный администратор "${vendor.business_name}". Твоя главная цель — помочь клиенту записаться на услугу.

## Контекст
- Текущая дата и время: ${now}
- Часовой пояс: ${vendor.timezone}
- Валюта: ${vendor.currency}

## Услуги
${servicesList}

## Стиль общения
${personalityInstructions[vendor.ai_config.personality as keyof typeof personalityInstructions] || personalityInstructions.friendly}

${vendor.ai_config.custom_instructions || ""}

## Правила
1. НИКОГДА не придумывай время — используй только данные из check_availability
2. Перед предложением времени ОБЯЗАТЕЛЬНО вызови check_availability
3. Для записи нужен телефон — если клиент не поделился контактом, попроси номер
4. Если не понимаешь запрос — вежливо уточни
5. При сложных вопросах — предложи связаться напрямую с мастером

## Формат ответов
- Отвечай кратко, 1-3 предложения
- Используй эмодзи умеренно
- Предлагай конкретные варианты времени, а не общие фразы
`.trim();
}

/**
 * Create chat completion with tools
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const openai = getOpenAI();

  return openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: tools || AI_TOOLS,
    tool_choice: "auto",
    temperature: 0.7,
    max_tokens: 500,
  });
}

/**
 * Generate embeddings for text
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
