import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ClientsPage() {
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

    // Get clients with their booking stats
    const { data: clients } = await supabase
        .from("clients")
        .select(
            `
            *,
            bookings:bookings(count)
        `
        )
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Клиенты</h1>
                    <p className="text-muted-foreground mt-2">
                        Управляйте базой клиентов
                    </p>
                </div>
            </div>

            {!clients || clients.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <svg
                            className="h-8 w-8 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        Пока нет клиентов
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Клиенты появятся автоматически после первых записей
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-medium">Имя</th>
                                    <th className="p-4 font-medium">Контакт</th>
                                    <th className="p-4 font-medium">
                                        Записей
                                    </th>
                                    <th className="p-4 font-medium">
                                        Последний визит
                                    </th>
                                    <th className="p-4 font-medium">
                                        Всего потрачено
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="border-b hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium">
                                                    {client.name ||
                                                        "Без имени"}
                                                </div>
                                                {client.notes && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {client.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {client.phone && (
                                                    <div className="text-sm">
                                                        📱 {client.phone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="text-sm text-muted-foreground">
                                                        ✉️ {client.email}
                                                    </div>
                                                )}
                                                {client.telegram_id && (
                                                    <div className="text-sm text-muted-foreground">
                                                        💬 Telegram
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                {client.total_bookings}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-muted-foreground">
                                                {client.last_visit_at
                                                    ? new Date(
                                                        client.last_visit_at
                                                    ).toLocaleDateString(
                                                        "ru-RU"
                                                    )
                                                    : "—"}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">
                                                {client.total_spent} ₽
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
