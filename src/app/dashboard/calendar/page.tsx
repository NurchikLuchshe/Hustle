import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CalendarPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    // Get vendor
    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!vendor) {
        redirect("/");
    }

    // Get all bookings for this vendor
    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
      *,
      services(name, duration_minutes, price),
      clients(name, phone)
    `)
        .eq("vendor_id", vendor.id)
        .order("start_time", { ascending: true });

    // Group bookings by date
    const grouped = (bookings || []).reduce((acc: any, booking: any) => {
        const date = new Date(booking.start_time).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        });

        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
    }, {});

    const totalBookings = bookings?.length || 0;
    const upcomingBookings =
        bookings?.filter(
            (b: any) => new Date(b.start_time) > new Date() && b.status === "confirmed"
        ).length || 0;
    const todayBookings =
        bookings?.filter((b: any) => {
            const bookingDate = new Date(b.start_time).toDateString();
            const today = new Date().toDateString();
            return bookingDate === today;
        }).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Календарь записей</h1>
                    <p className="text-muted-foreground mt-1">
                        Все ваши записи в одном месте
                    </p>
                </div>
                <Link
                    href="/dashboard/services"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Управление услугами
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Всего записей</div>
                    <div className="text-3xl font-bold mt-2">{totalBookings}</div>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Предстоящих</div>
                    <div className="text-3xl font-bold mt-2 text-primary">
                        {upcomingBookings}
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="text-sm text-muted-foreground">Сегодня</div>
                    <div className="text-3xl font-bold mt-2 text-green-600">
                        {todayBookings}
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {totalBookings === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <h2 className="text-xl font-semibold mb-2">Пока нет записей</h2>
                    <p className="text-muted-foreground mb-4">
                        Записи будут появляться здесь когда клиенты начнут записываться
                    </p>
                    <Link
                        href={`/${vendor.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        Открыть страницу записи
                        <svg
                            className="h-4 w-4"
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
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, dateBookings]: [string, any]) => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2">
                                {date}
                            </h2>
                            <div className="space-y-3">
                                {dateBookings.map((booking: any) => {
                                    const startTime = new Date(booking.start_time);
                                    const endTime = new Date(booking.end_time);
                                    const isPast = startTime < new Date();
                                    const isCancelled = booking.status === "cancelled";

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`rounded-lg border p-4 ${isPast
                                                    ? "bg-muted/50 opacity-60"
                                                    : isCancelled
                                                        ? "bg-destructive/10 border-destructive/20"
                                                        : "bg-card hover:shadow-md transition-shadow"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Time */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg
                                                            className="h-5 w-5 text-primary"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span className="font-semibold">
                                                            {startTime.toLocaleTimeString("ru-RU", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}{" "}
                                                            -{" "}
                                                            {endTime.toLocaleTimeString("ru-RU", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${isCancelled
                                                                    ? "bg-destructive/20 text-destructive"
                                                                    : isPast
                                                                        ? "bg-muted text-muted-foreground"
                                                                        : "bg-primary/20 text-primary"
                                                                }`}
                                                        >
                                                            {isCancelled
                                                                ? "Отменено"
                                                                : isPast
                                                                    ? "Завершено"
                                                                    : "Предстоит"}
                                                        </span>
                                                    </div>

                                                    {/* Service */}
                                                    <div className="text-lg font-medium mb-1">
                                                        {booking.services?.name || "Услуга удалена"}
                                                    </div>

                                                    {/* Client */}
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                />
                                                            </svg>
                                                            <span>{booking.clients?.name || "Неизвестно"}</span>
                                                        </div>
                                                        {booking.clients?.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                    />
                                                                </svg>
                                                                <span>{booking.clients.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold gradient-text">
                                                        {booking.price || booking.services?.price || 0}₽
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {booking.services?.duration_minutes} мин
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
