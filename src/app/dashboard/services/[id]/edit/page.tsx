import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import EditServiceForm from "./edit-service-form";

export default async function EditServicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/register");
    }

    // Get service
    const { data: service } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("vendor_id", vendor.id)
        .single();

    if (!service) {
        notFound();
    }

    type ServiceData = {
        id: string;
        name: string;
        description: string | null;
        category: string | null;
        price: number;
        duration_minutes: number;
        is_active: boolean;
    };

    return <EditServiceForm service={service as ServiceData} />;
}
