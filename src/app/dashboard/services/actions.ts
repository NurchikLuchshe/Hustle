"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validations/services";

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

// Create service
export async function createService(formData: FormData) {
    try {
        const vendorId = await getVendorId();

        const data = {
            name: formData.get("name") as string,
            description: (formData.get("description") as string) || undefined,
            category: (formData.get("category") as string) || undefined,
            price: parseFloat(formData.get("price") as string),
            duration_minutes: parseInt(formData.get("duration_minutes") as string),
            is_active: formData.get("is_active") === "true",
        };

        const parsed = serviceSchema.safeParse(data);
        if (!parsed.success) {
            return {
                error: parsed.error.errors[0].message,
            };
        }

        const supabase = await createClient();
        const { error } = await supabase.from("services").insert({
            vendor_id: vendorId,
            ...parsed.data,
        });

        if (error) {
            return {
                error: "Ошибка создания услуги: " + error.message,
            };
        }

        revalidatePath("/dashboard/services");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}

// Update service
export async function updateService(serviceId: string, formData: FormData) {
    try {
        const vendorId = await getVendorId();

        const data = {
            name: formData.get("name") as string,
            description: (formData.get("description") as string) || undefined,
            category: (formData.get("category") as string) || undefined,
            price: parseFloat(formData.get("price") as string),
            duration_minutes: parseInt(formData.get("duration_minutes") as string),
            is_active: formData.get("is_active") === "true",
        };

        const parsed = serviceSchema.safeParse(data);
        if (!parsed.success) {
            return {
                error: parsed.error.errors[0].message,
            };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("services")
            .update(parsed.data)
            .eq("id", serviceId)
            .eq("vendor_id", vendorId);

        if (error) {
            return {
                error: "Ошибка обновления услуги: " + error.message,
            };
        }

        revalidatePath("/dashboard/services");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}

// Delete service
export async function deleteService(serviceId: string) {
    try {
        const vendorId = await getVendorId();
        const supabase = await createClient();

        const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", serviceId)
            .eq("vendor_id", vendorId);

        if (error) {
            return {
                error: "Ошибка удаления услуги: " + error.message,
            };
        }

        revalidatePath("/dashboard/services");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}

// Toggle service active status
export async function toggleServiceStatus(serviceId: string, isActive: boolean) {
    try {
        const vendorId = await getVendorId();
        const supabase = await createClient();

        const { error } = await supabase
            .from("services")
            .update({ is_active: isActive })
            .eq("id", serviceId)
            .eq("vendor_id", vendorId);

        if (error) {
            return {
                error: "Ошибка изменения статуса: " + error.message,
            };
        }

        revalidatePath("/dashboard/services");
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
        };
    }
}
