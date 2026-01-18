"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/shared/types/database.types";
import { createManualBooking } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
    vendorId: string;
    services: Tables<"services">[];
    clients: Pick<Tables<"clients">, "id" | "name" | "phone" | "email">[];
}

export function BookingForm({
    vendorId,
    services,
    clients,
}: BookingFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<string>("");
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [newClientName, setNewClientName] = useState<string>("");
    const [newClientPhone, setNewClientPhone] = useState<string>("");
    const router = useRouter();
    const { toast } = useToast();

    const selectedServiceData = services.find((s) => s.id === selectedService);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createManualBooking(vendorId, formData);

            if (result.error) {
                toast({
                    title: "Ошибка",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Успешно",
                    description: "Запись создана",
                });
                router.push("/dashboard/calendar");
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось создать запись",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
            {/* Service Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Услуга *</label>
                <select
                    name="service_id"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                    className="w-full rounded-md border bg-background px-3 py-2"
                >
                    <option value="">Выберите услугу</option>
                    {services.map((service) => (
                        <option key={service.id} value={service.id}>
                            {service.name} — {service.price}₽ ({service.duration_minutes} мин)
                        </option>
                    ))}
                </select>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Клиент *</label>
                <select
                    name="client_id"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                >
                    <option value="">Новый клиент</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                            {client.name} ({client.phone})
                        </option>
                    ))}
                </select>
            </div>

            {/* New Client Fields */}
            {!selectedClient && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Имя клиента *</label>
                        <Input
                            name="client_name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            required
                            placeholder="Иван Иванов"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Телефон *</label>
                        <Input
                            name="client_phone"
                            type="tel"
                            value={newClientPhone}
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            required
                            placeholder="+7 999 123 45 67"
                        />
                    </div>
                </>
            )}

            {/* Date & Time */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Дата *</label>
                    <Input
                        name="date"
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Время *</label>
                    <Input name="time" type="time" required />
                </div>
            </div>

            {/* Duration Preview */}
            {selectedServiceData && (
                <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm text-muted-foreground">
                        Длительность: {selectedServiceData.duration_minutes} минут
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Стоимость: {selectedServiceData.price}₽
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Заметки (опционально)</label>
                <textarea
                    name="notes"
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2"
                    placeholder="Дополнительная информация о записи..."
                />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Создание..." : "Создать запись"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Отмена
                </Button>
            </div>
        </form>
    );
}
