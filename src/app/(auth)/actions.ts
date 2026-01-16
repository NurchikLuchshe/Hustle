"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Email + Password Login
export async function signIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
        return {
            error: parsed.error.errors[0].message,
        };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    });

    if (error) {
        return {
            error: "Неверный email или пароль",
        };
    }

    redirect("/dashboard");
}

// Email + Password Registration - используем Admin API
export async function signUp(formData: FormData) {
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        businessName: formData.get("businessName") as string,
        slug: formData.get("slug") as string,
    };

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
        return {
            error: parsed.error.errors[0].message,
        };
    }

    const supabase = await createClient();

    // Проверка что slug свободен
    const { data: existingVendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("slug", parsed.data.slug)
        .single();

    if (existingVendor) {
        return {
            error: "Такой URL уже занят. Попробуйте другой.",
        };
    }

    // Создаем пользователя через Admin API с автоподтверждением
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
            email: parsed.data.email,
            password: parsed.data.password,
            email_confirm: true, // Автоподтверждение email
        });

    if (authError) {
        return {
            error: authError.message,
        };
    }

    if (!authData.user) {
        return {
            error: "Ошибка создания аккаунта",
        };
    }

    // Создаем vendor запись
    const { error: vendorError } = await supabaseAdmin.from("vendors").insert({
        user_id: authData.user.id,
        slug: parsed.data.slug,
        business_name: parsed.data.businessName,
        email: parsed.data.email,
        plan: "start",
        ai_tokens_limit: 10000,
    });

    if (vendorError) {
        console.error("Vendor creation error:", vendorError);
        return {
            error: "Ошибка создания профиля: " + vendorError.message,
        };
    }

    // Авторизуем пользователя
    await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    });

    redirect("/dashboard");
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin") || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return {
            error: error.message,
        };
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
