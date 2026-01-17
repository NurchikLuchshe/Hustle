"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/dashboard";

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            // Redirect to dashboard on success
            redirect(next);
        }
    }

    // Redirect to error page if verification fails
    redirect("/auth/auth-error");
}
