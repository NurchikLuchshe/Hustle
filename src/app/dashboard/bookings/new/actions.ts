"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createManualBooking(
    vendorId: string,
    formData: FormData
) {
    const supabase = await createClient();

    const serviceId = formData.get("service_id") as string;
    const clientId = formData.get("client_id") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const notes = formData.get("notes") as string;

    // Get service to calculate end time
    const { data: service } = await supabase
        .from("services")
        .select("duration_minutes, price")
        .eq("id", serviceId)
        .single();

    if (!service) {
        return { error: "Услуга не найдена" };
    }

    // Combine date and time
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(
        startTime.getTime() + service.duration_minutes * 60000
    );

    let finalClientId = clientId;

    // Create new client if needed
    if (!clientId) {
        const clientName = formData.get("client_name") as string;
        const clientPhone = formData.get("client_phone") as string;

        const { data: newClient, error: clientError } = await supabase
            .from("clients")
            .insert({
                vendor_id: vendorId,
                name: clientName,
                phone: clientPhone,
            })
            .select("id")
            .single();

        if (clientError || !newClient) {
            return { error: "Не удалось создать клиента" };
        }

        finalClientId = newClient.id;
    }

    // Check for conflicts
    const { data: conflicts } = await supabase
        .from("bookings")
        .select("id")
        .eq("vendor_id", vendorId)
        .neq("status", "cancelled")
        .gte("end_time", startTime.toISOString())
        .lte("start_time", endTime.toISOString());

    if (conflicts && conflicts.length > 0) {
        return { error: "В это время уже есть запись" };
    }

    // Create booking
    const { error } = await supabase.from("bookings").insert({
        vendor_id: vendorId,
        client_id: finalClientId,
        service_id: serviceId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
        source: "manual",
        price: service.price,
        notes,
    });

    if (error) {
        return { error: error.message };
    }

    // Update client stats
    await supabase.rpc("increment", {
        table_name: "clients",
        id: finalClientId,
        column_name: "total_bookings",
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/clients");

    return { success: true };
}
