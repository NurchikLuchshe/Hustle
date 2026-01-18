import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookingForm } from "./booking-form";

export default async function NewBookingPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/dashboard/onboarding");
    }

    // Get services
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("vendor_id", vendor.id)
        .eq("is_active", true)
        .order("sort_order");

    // Get clients for autocomplete
    const { data: clients } = await supabase
        .from("clients")
        .select("id, name, phone, email")
        .eq("vendor_id", vendor.id)
        .order("name");

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Создать запись</h1>
                <p className="text-muted-foreground mt-2">
                    Добавьте запись вручную для клиента
                </p>
            </div>

            <BookingForm
                vendorId={vendor.id}
                services={services || []}
                clients={clients || []}
            />
        </div>
    );
}
