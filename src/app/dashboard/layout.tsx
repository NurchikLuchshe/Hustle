import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Получаем vendor данные
    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/register");
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Simple Header */}
            <header className="border-b bg-background">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold gradient-text">
                        AI-Booking
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {vendor.business_name}
                        </span>
                        <form action={async () => {
                            "use server";
                            const supabase = await createClient();
                            await supabase.auth.signOut();
                            redirect("/");
                        }}>
                            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                                Выйти
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container py-8">{children}</main>

            {/* Footer */}
            <footer className="border-t py-6">
                <div className="container text-center text-sm text-muted-foreground">
                    © 2024 AI-Booking · {vendor.slug}
                </div>
            </footer>
        </div>
    );
}
