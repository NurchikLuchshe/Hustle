import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/register");
    }

    // Получаем статистику
    const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendor.id);

    const { count: servicesCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendor.id);

    const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendor.id);

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-bold">
                    Добро пожаловать, {vendor.business_name}!
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Управляйте записями и услугами вашего бизнеса
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="premium-card rounded-lg border bg-card p-6">
                    <div className="text-2xl font-bold gradient-text">
                        {bookingsCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        Всего записей
                    </div>
                </div>

                <div className="premium-card rounded-lg border bg-card p-6">
                    <div className="text-2xl font-bold gradient-text">
                        {servicesCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Услуг</div>
                </div>

                <div className="premium-card rounded-lg border bg-card p-6">
                    <div className="text-2xl font-bold gradient-text">
                        {clientsCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Клиентов</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <a
                        href="/dashboard/services"
                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Добавить услугу</div>
                            <div className="text-sm text-muted-foreground">
                                Создайте новую услугу
                            </div>
                        </div>
                    </a>

                    <a
                        href={`/${vendor.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Страница записи</div>
                            <div className="text-sm text-muted-foreground">
                                Просмотреть публичную страницу
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
