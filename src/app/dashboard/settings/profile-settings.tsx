"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/shared/types/database.types";
import { updateVendorProfile } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsProps {
    vendor: Tables<"vendors">;
}

export function ProfileSettings({ vendor }: ProfileSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateVendorProfile(formData);

            if (result.error) {
                toast({
                    title: "Ошибка",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Успешно",
                    description: "Профиль обновлен",
                });
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить профиль",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Информация о бизнесе</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="business_name">Название</Label>
                    <Input
                        id="business_name"
                        name="business_name"
                        defaultValue={vendor.business_name}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Ссылка (slug)</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            aibooking.me/
                        </span>
                        <Input
                            id="slug"
                            name="slug"
                            defaultValue={vendor.slug}
                            required
                            pattern="[a-z0-9-]+"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Только буквы, цифры и дефис
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={vendor.description || ""}
                        rows={3}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={vendor.phone || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={vendor.email || ""}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Часовой пояс</Label>
                        <Input
                            id="timezone"
                            name="timezone"
                            defaultValue={vendor.timezone}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Валюта</Label>
                        <Input
                            id="currency"
                            name="currency"
                            defaultValue={vendor.currency}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Сохранение..." : "Сохранить изменения"}
                </Button>
            </form>
        </div>
    );
}
