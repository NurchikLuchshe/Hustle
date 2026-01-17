"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBooking(formData: FormData) {
    try {
        const vendorId = formData.get("vendor_id") as string;
        const serviceId = formData.get("service_id") as string;
        const date = formData.get("date") as string;
        const time = formData.get("time") as string;
        const clientName = formData.get("client_name") as string;
        const clientPhone = formData.get("client_phone") as string;

        // Validation
        if (!clientName || !clientPhone) {
            return { error: "Заполните все поля" };
        }

        if (clientPhone.length < 10) {
            return { error: "Введите корректный номер телефона" };
        }

        const supabase = await createClient();

        // 1. Find or create client
        let client;
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", clientPhone)
            .eq("vendor_id", vendorId)
            .single();

        if (existingClient) {
            client = existingClient;
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({
                    vendor_id: vendorId,
                    name: clientName,
                    phone: clientPhone,
                })
                .select("id")
                .single();

            if (clientError) {
                return { error: "Ошибка создания клиента: " + clientError.message };
            }

            client = newClient;
        }

        // 2. Get service to calculate end time
        const { data: service } = await supabase
            .from("services")
            .select("duration_minutes")
            .eq("id", serviceId)
            .single();

        if (!service) {
            return { error: "Услуга не найдена" };
        }

        // 3. Create start_time and end_time
        const startTime = `${date}T${time}:00`;
        const endDate = new Date(startTime);
        endDate.setMinutes(endDate.getMinutes() + service.duration_minutes);
        const endTime = endDate.toISOString();

        // 4. Check if slot is available
        const { data: existingBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("vendor_id", vendorId)
            .gte("start_time", startTime)
            .lt("start_time", endTime)
            .in("status", ["confirmed", "pending"]);

        if (existingBookings && existingBookings.length > 0) {
            return { error: "Это время уже занято. Выберите другое." };
        }

        // 5. Create booking
        const { error: bookingError } = await supabase.from("bookings").insert({
            vendor_id: vendorId,
            client_id: client.id,
            service_id: serviceId,
            start_time: startTime,
            end_time: endTime,
            status: "confirmed",
            source: "web",
        });

        if (bookingError) {
            return { error: "Ошибка создания записи: " + bookingError.message };
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}
