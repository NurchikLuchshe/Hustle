"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { createBooking } from "./actions";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
}

interface Vendor {
    id: string;
    business_name: string;
    slug: string;
}

export default function BookingModal({
    vendor,
    service,
    onClose,
}: {
    vendor: Vendor;
    service: Service;
    onClose: () => void;
}) {
    const [step, setStep] = useState<"date" | "time" | "contact">("date");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Generate next 14 days
    const availableDates = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    // Simple time slots (every hour from 9 to 18)
    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00",
        "17:00", "18:00",
    ];

    async function handleSubmit() {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("vendor_id", vendor.id);
        formData.append("service_id", service.id);
        formData.append("date", selectedDate);
        formData.append("time", selectedTime);
        formData.append("client_name", clientName);
        formData.append("client_phone", clientPhone);

        const result = await createBooking(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-card rounded-xl max-w-md w-full p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold mb-2">Вы записаны!</h2>
                    <p className="text-muted-foreground mb-4">
                        {new Date(selectedDate).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                        })}{" "}
                        в {selectedTime}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Мы отправили подтверждение на {clientPhone}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card rounded-xl max-w-2xl w-full p-6 my-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">{service.name}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">
                                {service.price}₽
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {service.duration_minutes} мин
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-accent transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                    {/* Date Selection */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Выберите дату
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {availableDates.map((date) => {
                                const dateStr = date.toISOString().split("T")[0];
                                const isSelected = selectedDate === dateStr;
                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => {
                                            setSelectedDate(dateStr);
                                            setStep("time");
                                        }}
                                        className={`p-3 rounded-lg border text-center transition-colors ${isSelected
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "hover:bg-accent"
                                            }`}
                                    >
                                        <div className="text-xs text-muted-foreground">
                                            {date.toLocaleDateString("ru-RU", { weekday: "short" })}
                                        </div>
                                        <div className="font-semibold">{date.getDate()}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Выберите время
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {timeSlots.map((time) => {
                                    const isSelected = selectedTime === time;
                                    return (
                                        <button
                                            key={time}
                                            onClick={() => {
                                                setSelectedTime(time);
                                                setStep("contact");
                                            }}
                                            className={`p-3 rounded-lg border text-center font-medium transition-colors ${isSelected
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "hover:bg-accent"
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Contact Form */}
                    {selectedTime && (
                        <div>
                            <h3 className="font-semibold mb-3">Ваши данные</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Имя</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Иван Иванов"
                                        className="w-full rounded-md border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Телефон
                                    </label>
                                    <input
                                        type="tel"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="+7 900 123 45 67"
                                        className="w-full rounded-md border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    {selectedTime && (
                        <button
                            onClick={handleSubmit}
                            disabled={!clientName || !clientPhone || loading}
                            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Создание записи..." : "Записаться"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
