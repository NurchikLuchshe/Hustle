import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QRCodeGenerator } from "@/components/qr-code-generator";

export default async function QRCodePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: vendor } = await supabase
        .from("vendors")
        .select("slug, business_name")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/dashboard/onboarding");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">QR-код для записи</h1>
                <p className="text-muted-foreground mt-2">
                    Распечатайте или поделитесь QR-кодом с клиентами
                </p>
            </div>

            <QRCodeGenerator
                slug={vendor.slug}
                businessName={vendor.business_name}
            />
        </div>
    );
}
