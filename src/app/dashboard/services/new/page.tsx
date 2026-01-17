"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createService } from "../actions";
import { categoryLabels } from "@/lib/validations/services";

export default function NewServicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await createService(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/dashboard/services");
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/services"
                    className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                >
                    ← Назад к услугам
                </Link>
                <h1 className="text-3xl font-bold">Добавить услугу</h1>
                <p className="text-muted-foreground mt-1">
                    Заполните информацию о новой услуге
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg border bg-card p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-2"
                        >
                            Название услуги <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Например: Мужская стрижка"
                            className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium mb-2"
                        >
                            Описание
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Краткое описание услуги..."
                            className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium mb-2"
                        >
                            Категория
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Не выбрано</option>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium mb-2"
                            >
                                Цена (₽) <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                required
                                min="0"
                                step="1"
                                placeholder="1000"
                                className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="duration_minutes"
                                className="block text-sm font-medium mb-2"
                            >
                                Длительность (мин) <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="number"
                                id="duration_minutes"
                                name="duration_minutes"
                                required
                                min="5"
                                step="5"
                                placeholder="30"
                                className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            value="true"
                            defaultChecked
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">
                            Услуга активна (доступна для записи)
                        </label>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/services"
                        className="flex-1 rounded-lg border px-4 py-2 text-center hover:bg-accent transition-colors"
                    >
                        Отмена
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Создание..." : "Создать услугу"}
                    </button>
                </div>
            </form>
        </div>
    );
}
