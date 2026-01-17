import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import DeleteServiceButton from "./delete-service-button";

export default async function ServicesPage() {
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

    // Get services
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });

    type Service = {
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration_minutes: number;
        is_active: boolean;
    };

    const servicesList = (services || []) as Service[];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Услуги</h1>
                    <p className="text-muted-foreground mt-1">
                        Управляйте своими услугами и ценами
                    </p>
                </div>
                <Link
                    href="/dashboard/services/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Добавить услугу
                </Link>
            </div>

            {/* Services List */}
            {!servicesList || servicesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        Пока нет услуг
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                        Добавьте первую услугу, чтобы клиенты могли записываться к вам
                    </p>
                    <Link
                        href="/dashboard/services/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Добавить услугу
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {servicesList.map((service) => (
                        <div
                            key={service.id}
                            className="premium-card rounded-lg border bg-card p-6 space-y-4"
                        >
                            {/* Service Header */}
                            <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg">{service.name}</h3>
                                    {service.is_active ? (
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                                            Активна
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-600">
                                            Неактивна
                                        </span>
                                    )}
                                </div>
                                {service.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {service.description}
                                    </p>
                                )}
                            </div>

                            {/* Service Details */}
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <span className="text-2xl font-bold gradient-text">
                                        {service.price}₽
                                    </span>
                                </div>
                                <div className="text-muted-foreground">
                                    {service.duration_minutes} мин
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={`/dashboard/services/${service.id}/edit`}
                                    className="flex-1 rounded-md border px-3 py-2 text-center text-sm hover:bg-accent transition-colors"
                                >
                                    Редактировать
                                </Link>
                                <DeleteServiceButton serviceId={service.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
