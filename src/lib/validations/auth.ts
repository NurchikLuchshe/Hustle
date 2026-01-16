import { z } from "zod";

// Login schema - email + password
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email обязателен")
        .email("Введите корректный email"),
    password: z
        .string()
        .min(6, "Пароль должен содержать минимум 6 символов"),
});

// Register schema - email, название бизнеса, slug, password
export const registerSchema = z.object({
    email: z
        .string()
        .min(1, "Email обязателен")
        .email("Введите корректный email"),
    password: z
        .string()
        .min(6, "Пароль должен содержать минимум 6 символов"),
    businessName: z
        .string()
        .min(2, "Название должно содержать минимум 2 символа")
        .max(100, "Название слишком длинное"),
    slug: z
        .string()
        .min(3, "Slug должен содержать минимум 3 символа")
        .max(50, "Slug слишком длинный")
        .regex(
            /^[a-z0-9-]+$/,
            "Только строчные латинские буквы, цифры и дефис"
        )
        .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
            message: "Slug не может начинаться или заканчиваться на дефис",
        }),
});

// TypeScript types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
