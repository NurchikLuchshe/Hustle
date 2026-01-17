"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Get vendor ID for current user
async function getVendorId() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        throw new Error("Vendor not found");
    }

    return vendor.id;
}

export async function completeOnboarding(formData: FormData) {
    try {
        const vendorId = await getVendorId();
        const supabase = await createClient();

        // Get form data
        const serviceName = formData.get("service_name") as string;
        const servicePrice = parseFloat(formData.get("service_price") as string);
        const serviceDuration = parseInt(formData.get("service_duration") as string);
        const scheduleJson = formData.get("schedule") as string;

        // Validation
        if (!serviceName || !servicePrice || !serviceDuration) {
            return {
                error: "Все поля обязательны для заполнения",
            };
        }

        if (servicePrice <= 0) {
            return {
                error: "Цена должна быть больше 0",
            };
        }

        if (serviceDuration < 5) {
            return {
                error: "Минимальная длительность 5 минут",
            };
        }

        // Create service
        const { error: serviceError } = await supabase.from("services").insert({
            vendor_id: vendorId,
            name: serviceName,
            price: servicePrice,
            duration_minutes: serviceDuration,
            is_active: true,
            is_online_bookable: true,
        });

        if (serviceError) {
            return {
                error: "Ошибка создания услуги: " + serviceError.message,
            };
        }

        // Create work schedule
        const schedule = JSON.parse(scheduleJson);
        const scheduleEntries = schedule
            .filter((day: any) => day.enabled)
            .map((day: any) => ({
                vendor_id: vendorId,
                day_of_week: getDayNumber(day.day),
                start_time: day.start,
                end_time: day.end,
            }));

        if (scheduleEntries.length > 0) {
            const { error: scheduleError } = await supabase
                .from("work_schedules")
                .insert(scheduleEntries);

            if (scheduleError) {
                return {
                    error: "Ошибка создания графика: " + scheduleError.message,
                };
            }
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}

function getDayNumber(day: string): number {
    const days: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
    };
    return days[day] || 1;
}
