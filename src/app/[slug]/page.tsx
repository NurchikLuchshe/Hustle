import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingPageClient from "./booking-client";

export default async function PublicBookingPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    // Check if current user is the vendor
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let isVendorOwner = false;
    if (user) {
        const { data: userVendor } = await supabase
            .from("vendors")
            .select("slug")
            .eq("user_id", user.id)
            .single();
        isVendorOwner = userVendor?.slug === slug;
    }

    // Get vendor by slug
    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!vendor) {
        notFound();
    }

    // Get active services
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("vendor_id", vendor.id)
        .eq("is_active", true)
        .eq("is_online_bookable", true)
        .order("price", { ascending: true });

    if (!services || services.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{vendor.business_name}</h1>
                    <p className="text-muted-foreground">
                        Скоро здесь появятся наши услуги
                    </p>
                </div>
            </div>
        );
    }

    return <BookingPageClient vendor={vendor} services={services} isVendorOwner={isVendorOwner} />;
}
