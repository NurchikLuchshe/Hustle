"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface RecognizedService {
    name: string;
    price: number;
    price_type: "fixed" | "from" | "range";
    price_max?: number;
    duration_minutes: number;
    category: string;
    description?: string;
}

interface RecognitionResult {
    success: boolean;
    services?: RecognizedService[];
    error?: string;
    confidence?: number;
    notes?: string;
}

export async function recognizePriceList(
    imageDataUrl: string
): Promise<RecognitionResult> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return {
                success: false,
                error: "OpenAI API key не настроен",
            };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Ты — AI-ассистент для извлечения структурированных данных из изображений прайс-листов салонов красоты и индивидуальных мастеров.

Твоя задача: проанализируй изображение и извлеки информацию об услугах в формате JSON.

Правила извлечения:

1. Названия услуг - сохраняй оригинальное название
2. Цены - определи тип:
   - "fixed" - фиксированная цена (1500₽)
   - "from" - от суммы (от 2000₽)
   - "range" - диапазон (1500-3000₽)
3. Длительность - если НЕ указана, оцени по стандартам:
   - Мужская стрижка: 45 мин
   - Женская стрижка: 60 мин
   - Окрашивание: 120-180 мин
   - Маникюр: 60 мин
   - Педикюр: 90 мин
   - Массаж: 60 мин
   - Чистка лица: 60 мин
   - Укладка: 45 мин
   - Брови/ресницы: 30-60 мин

4. Категории:
   - haircut (стрижки)
   - coloring (окрашивание)
   - styling (укладки)
   - nails (маникюр/педикюр)
   - massage (массаж)
   - facial (уход за лицом)
   - brows (брови/ресницы)
   - waxing (эпиляция)
   - other (прочее)

ВСЕГДА отвечай ТОЛЬКО валидным JSON в формате:
{
  "success": true,
  "services": [
    {
      "name": "Мужская стрижка",
      "price": 1500,
      "price_type": "fixed",
      "price_max": null,
      "duration_minutes": 45,
      "category": "haircut",
      "description": null
    }
  ],
  "confidence": 0.95,
  "notes": "Обнаружено 12 услуг"
}

Если изображение нечёткое или не содержит прайс-лист:
{
  "success": false,
  "error": "Не удалось распознать прайс-лист. Пожалуйста, пришлите более чёткое фото."
}`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Извлеки услуги из этого прайс-листа.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageDataUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 2000,
            temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            return {
                success: false,
                error: "Не удалось получить ответ от AI",
            };
        }

        // Parse JSON from response
        const result = JSON.parse(content) as RecognitionResult;

        return result;
    } catch (error) {
        console.error("Error recognizing price list:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Ошибка при распознавании",
        };
    }
}
