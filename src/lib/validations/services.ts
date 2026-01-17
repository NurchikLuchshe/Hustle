import { z } from "zod";

// Service creation/update schema
export const serviceSchema = z.object({
    name: z
        .string()
        .min(2, "Название должно содержать минимум 2 символа")
        .max(100, "Название слишком длинное"),
    description: z.string().max(500, "Описание слишком длинное").optional(),
    category: z.enum([
        "haircut",
        "nails",
        "massage",
        "beauty",
        "medical",
        "fitness",
        "other",
    ]).optional(),
    price: z
        .number()
        .min(0, "Цена не может быть отрицательной")
        .max(1000000, "Цена слишком большая"),
    duration_minutes: z
        .number()
        .min(5, "Минимальная длительность 5 минут")
        .max(1440, "Максимальная длительность 24 часа"),
    is_active: z.boolean().default(true),
});

// TypeScript types
export type ServiceInput = z.infer<typeof serviceSchema>;

// Category labels for UI
export const categoryLabels: Record<string, string> = {
    haircut: "Стрижка",
    nails: "Маникюр/Педикюр",
    massage: "Массаж",
    beauty: "Красота",
    medical: "Медицинские",
    fitness: "Фитнес",
    other: "Другое",
};
