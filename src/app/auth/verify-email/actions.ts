"use server";

import { createClient } from "@/lib/supabase/server";

export async function resendVerificationEmail(email: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
            },
        });

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { error: "Произошла ошибка. Попробуйте позже." };
    }
}
