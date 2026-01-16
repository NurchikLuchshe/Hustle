import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const slug = requestUrl.searchParams.get("slug");
    const businessName = requestUrl.searchParams.get("businessName");

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);

        // Если это регистрация (есть slug и businessName)
        if (slug && businessName) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                // Создаем vendor запись
                const { error } = await supabase.from("vendors").insert({
                    user_id: user.id,
                    slug: slug,
                    business_name: decodeURIComponent(businessName),
                    email: user.email,
                    plan: "start",
                    ai_tokens_limit: 10000,
                });

                if (error) {
                    console.error("Error creating vendor:", error);
                    return NextResponse.redirect(`${requestUrl.origin}/register?error=vendor_creation_failed`);
                }
            }
        }
    }

    // Редирект в dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
