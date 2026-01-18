"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { completeOnboarding } from "./actions";
import { PriceListUploader } from "@/components/onboarding/price-list-uploader";

const steps = [
    { id: 1, name: "Приветствие" },
    { id: 2, name: "Загрузка прайса (AI)" },
    { id: 3, name: "Проверка услуг" },
    { id: 4, name: "График работы" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [services, setServices] = useState<any[]>([]);
    const [skipAI, setSkipAI] = useState(false);

    const [schedule, setSchedule] = useState([
        { day: "monday", enabled: true, start: "09:00", end: "18:00" },
        { day: "tuesday", enabled: true, start: "09:00", end: "18:00" },
        { day: "wednesday", enabled: true, start: "09:00", end: "18:00" },
        { day: "thursday", enabled: true, start: "09:00", end: "18:00" },
        { day: "friday", enabled: true, start: "09:00", end: "18:00" },
        { day: "saturday", enabled: false, start: "10:00", end: "16:00" },
        { day: "sunday", enabled: false, start: "10:00", end: "16:00" },
    ]);

    const dayLabels: Record<string, string> = {
        monday: "Понедельник",
        tuesday: "Вторник",
        wednesday: "Среда",
        thursday: "Четверг",
        friday: "Пятница",
        saturday: "Суббота",
        sunday: "Воскресенье",
    };

    async function handleComplete() {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("service_name", serviceData.name);
        formData.append("service_price", serviceData.price);
        formData.append("service_duration", serviceData.duration);
        formData.append("schedule", JSON.stringify(schedule));

        const result = await completeOnboarding(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep > step.id
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : currentStep === step.id
                                            ? "border-primary text-primary"
                                            : "border-muted text-muted-foreground"
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`h-0.5 w-20 mx-2 transition-colors ${currentStep > step.id ? "bg-primary" : "bg-muted"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                        Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].name}
                    </p>
                </div>

                {/* Content Card */}
                <div className="premium-card rounded-xl border bg-card p-8 shadow-lg">
                    {/* Step 1: Welcome */}
                    {currentStep === 1 && (
                        <div className="text-center space-y-6">
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-3xl font-bold gradient-text">
                                Добро пожаловать в AI-Booking!
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Настроим ваш бизнес за 2 минуты
                            </p>

                            <div className="bg-primary/5 rounded-lg p-6 space-y-3 text-left">
                                <div className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Добавим первую услугу</p>
                                        <p className="text-sm text-muted-foreground">
                                            Название, цена и длительность
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Настроим график работы</p>
                                        <p className="text-sm text-muted-foreground">
                                            Выберите рабочие дни и часы
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Готово!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Ваша страница записи будет готова
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold">Добавьте первую услугу</h2>
                                <p className="text-muted-foreground mt-1">
                                    Вы сможете добавить больше услуг позже
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Название услуги
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceData.name}
                                        onChange={(e) =>
                                            setServiceData((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Например: Мужская стрижка"
                                        className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Цена (₽)
                                        </label>
                                        <input
                                            type="number"
                                            value={serviceData.price}
                                            onChange={(e) =>
                                                setServiceData((prev) => ({
                                                    ...prev,
                                                    price: e.target.value,
                                                }))
                                            }
                                            placeholder="1000"
                                            min="0"
                                            className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Длительность (мин)
                                        </label>
                                        <input
                                            type="number"
                                            value={serviceData.duration}
                                            onChange={(e) =>
                                                setServiceData((prev) => ({
                                                    ...prev,
                                                    duration: e.target.value,
                                                }))
                                            }
                                            placeholder="30"
                                            min="5"
                                            step="5"
                                            className="w-full rounded-md border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Schedule */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold">График работы</h2>
                                <p className="text-muted-foreground mt-1">
                                    Выберите когда вы принимаете клиентов
                                </p>
                            </div>

                            <div className="space-y-3">
                                {schedule.map((day, index) => (
                                    <div
                                        key={day.day}
                                        className="flex items-center gap-4 p-4 rounded-lg border bg-background"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={day.enabled}
                                            onChange={(e) => {
                                                const newSchedule = [...schedule];
                                                newSchedule[index].enabled = e.target.checked;
                                                setSchedule(newSchedule);
                                            }}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                                            <span className="font-medium">{dayLabels[day.day]}</span>
                                            {day.enabled ? (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={day.start}
                                                        onChange={(e) => {
                                                            const newSchedule = [...schedule];
                                                            newSchedule[index].start = e.target.value;
                                                            setSchedule(newSchedule);
                                                        }}
                                                        className="rounded-md border bg-background px-3 py-1.5 text-sm"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={day.end}
                                                        onChange={(e) => {
                                                            const newSchedule = [...schedule];
                                                            newSchedule[index].end = e.target.value;
                                                            setSchedule(newSchedule);
                                                        }}
                                                        className="rounded-md border bg-background px-3 py-1.5 text-sm"
                                                    />
                                                </>
                                            ) : (
                                                <span className="col-span-2 text-sm text-muted-foreground">
                                                    Выходной
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="flex-1 rounded-lg border px-4 py-2 hover:bg-accent transition-colors"
                            >
                                ← Назад
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={
                                    currentStep === 2 &&
                                    (!serviceData.name || !serviceData.price || !serviceData.duration)
                                }
                                className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                Далее →
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Сохранение..." : "Завершить настройку →"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
