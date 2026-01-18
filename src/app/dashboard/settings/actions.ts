"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateVendorProfile(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Не авторизован" };
    }

    const businessName = formData.get("business_name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const timezone = formData.get("timezone") as string;
    const currency = formData.get("currency") as string;

    const { error } = await supabase
        .from("vendors")
        .update({
            business_name: businessName,
            slug: slug.toLowerCase(),
            description,
            phone,
            email,
            timezone,
            currency,
        })
        .eq("user_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function updateWorkSchedule(
    vendorId: string,
    schedules: Record<number, { isWorking: boolean; start: string; end: string }>
) {
    const supabase = await createClient();

    // Delete all existing schedules for this vendor
    await supabase.from("work_schedules").delete().eq("vendor_id", vendorId);

    // Insert new schedules
    const schedulesToInsert = Object.entries(schedules).map(
        ([dayOfWeek, schedule]) => ({
            vendor_id: vendorId,
            day_of_week: parseInt(dayOfWeek),
            start_time: schedule.start,
            end_time: schedule.end,
            is_working_day: schedule.isWorking,
            breaks: [],
        })
    );

    const { error } = await supabase
        .from("work_schedules")
        .insert(schedulesToInsert);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}
