"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAvailableTimeSlots(
    vendorId: string,
    date: string, // YYYY-MM-DD
    serviceDuration: number
) {
    try {
        const supabase = await createClient();

        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        // Get vendor's work schedule for this day
        const { data: schedule } = await supabase
            .from("work_schedules")
            .select("start_time, end_time")
            .eq("vendor_id", vendorId)
            .eq("day_of_week", dayOfWeek)
            .single();

        if (!schedule) {
            // No work schedule for this day
            return { slots: [], error: "Не рабочий день" };
        }

        // Get existing bookings for this date
        const { data: bookings } = await supabase
            .from("bookings")
            .select("start_time, end_time")
            .eq("vendor_id", vendorId)
            .gte("start_time", `${date}T00:00:00`)
            .lt("start_time", `${date}T23:59:59`)
            .in("status", ["confirmed", "pending"]);

        // Generate time slots based on work schedule
        const startHour = parseInt(schedule.start_time.split(":")[0]);
        const startMinute = parseInt(schedule.start_time.split(":")[1]);
        const endHour = parseInt(schedule.end_time.split(":")[0]);
        const endMinute = parseInt(schedule.end_time.split(":")[1]);

        const slots: string[] = [];
        let currentHour = startHour;
        let currentMinute = startMinute;

        while (
            currentHour < endHour ||
            (currentHour === endHour && currentMinute < endMinute)
        ) {
            // Format time as HH:MM
            const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(
                currentMinute
            ).padStart(2, "0")}`;

            // Calculate end time for this slot
            const slotDate = new Date(date);
            slotDate.setHours(currentHour, currentMinute, 0, 0);
            const slotEndDate = new Date(slotDate.getTime() + serviceDuration * 60000);

            // Check if slot is available (no conflict with existing bookings)
            const isAvailable = !bookings?.some((booking) => {
                const bookingStart = new Date(booking.start_time);
                const bookingEnd = new Date(booking.end_time);

                // Check for overlap
                return (
                    (slotDate >= bookingStart && slotDate < bookingEnd) ||
                    (slotEndDate > bookingStart && slotEndDate <= bookingEnd) ||
                    (slotDate <= bookingStart && slotEndDate >= bookingEnd)
                );
            });

            // Check if slot end time is within work hours
            const slotEndHour = slotEndDate.getHours();
            const slotEndMinute = slotEndDate.getMinutes();
            const withinWorkHours =
                slotEndHour < endHour ||
                (slotEndHour === endHour && slotEndMinute <= endMinute);

            if (isAvailable && withinWorkHours) {
                slots.push(timeSlot);
            }

            // Move to next hour
            currentMinute += 60;
            if (currentMinute >= 60) {
                currentMinute = 0;
                currentHour++;
            }
        }

        return { slots, error: null };
    } catch (error) {
        console.error("Error getting available slots:", error);
        return { slots: [], error: "Ошибка загрузки слотов" };
    }
}
