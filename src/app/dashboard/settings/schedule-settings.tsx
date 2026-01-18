"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Tables } from "@/shared/types/database.types";
import { updateWorkSchedule } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface ScheduleSettingsProps {
    vendorId: string;
    initialSchedules: Tables<"work_schedules">[];
}

const DAYS = [
    { value: 0, label: "Понедельник" },
    { value: 1, label: "Вторник" },
    { value: 2, label: "Среда" },
    { value: 3, label: "Четверг" },
    { value: 4, label: "Пятница" },
    { value: 5, label: "Суббота" },
    { value: 6, label: "Воскресенье" },
];

export function ScheduleSettings({
    vendorId,
    initialSchedules,
}: ScheduleSettingsProps) {
    const [schedules, setSchedules] = useState<
        Record<number, { isWorking: boolean; start: string; end: string }>
    >(() => {
        const initial: Record<
            number,
            { isWorking: boolean; start: string; end: string }
        > = {};

        DAYS.forEach((day) => {
            const existing = initialSchedules.find(
                (s) => s.day_of_week === day.value
            );
            initial[day.value] = {
                isWorking: existing?.is_working_day ?? false,
                start: existing?.start_time || "09:00",
                end: existing?.end_time || "18:00",
            };
        });

        return initial;
    });

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleToggle = (dayValue: number) => {
        setSchedules((prev) => ({
            ...prev,
            [dayValue]: {
                ...prev[dayValue],
                isWorking: !prev[dayValue].isWorking,
            },
        }));
    };

    const handleTimeChange = (
        dayValue: number,
        field: "start" | "end",
        value: string
    ) => {
        setSchedules((prev) => ({
            ...prev,
            [dayValue]: {
                ...prev[dayValue],
                [field]: value,
            },
        }));
    };

    async function handleSave() {
        setIsLoading(true);

        try {
            const result = await updateWorkSchedule(vendorId, schedules);

            if (result.error) {
                toast({
                    title: "Ошибка",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Успешно",
                    description: "Рабочий график сохранен",
                });
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить график",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Рабочие дни и часы</h3>
            <p className="text-sm text-muted-foreground mb-6">
                Настройте график работы для автоматического определения
                доступных слотов
            </p>

            <div className="space-y-4">
                {DAYS.map((day) => {
                    const schedule = schedules[day.value];
                    return (
                        <div
                            key={day.value}
                            className="flex items-center gap-4 p-4 rounded-lg border"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <Switch
                                    checked={schedule.isWorking}
                                    onCheckedChange={() =>
                                        handleToggle(day.value)
                                    }
                                />
                                <Label className="w-32">{day.label}</Label>
                            </div>

                            {schedule.isWorking && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={schedule.start}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                day.value,
                                                "start",
                                                e.target.value
                                            )
                                        }
                                        className="px-3 py-2 rounded-md border bg-background"
                                    />
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                    <input
                                        type="time"
                                        value={schedule.end}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                day.value,
                                                "end",
                                                e.target.value
                                            )
                                        }
                                        className="px-3 py-2 rounded-md border bg-background"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Сохранение..." : "Сохранить график"}
                </Button>
            </div>
        </div>
    );
}
