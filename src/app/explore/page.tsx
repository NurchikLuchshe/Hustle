import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default async function ExplorePage() {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Get all vendors with their services
    const { data: vendors } = await supabase
        .from("vendors")
        .select(`
      id,
      business_name,
      slug,
      description,
      services(
        id,
        name,
        price,
        duration_minutes,
        is_active
      )
    `)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navigation isAuthenticated={!!user} />

            {/* Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4 gradient-text">
                        Найдите своего мастера
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Выберите из {vendors?.length || 0} доступных специалистов
                    </p>
                </div>

                {!vendors || vendors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-semibold mb-2">Пока нет мастеров</h2>
                        <p className="text-muted-foreground mb-6">
                            Станьте первым и зарегистрируйтесь!
                        </p>
                        <Link
                            href="/register"
                            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Зарегистрироваться как мастер
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {vendors.map((vendor: any) => {
                            const activeServices = vendor.services?.filter(
                                (s: any) => s.is_active
                            ) || [];

                            return (
                                <Link
                                    key={vendor.id}
                                    href={`/${vendor.slug}`}
                                    className="group premium-card rounded-xl border bg-card p-6 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Vendor Header */}
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                                            {vendor.business_name}
                                        </h2>
                                        {vendor.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {vendor.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Services Preview */}
                                    {activeServices.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Услуги ({activeServices.length}):
                                            </div>
                                            <div className="space-y-2">
                                                {activeServices.slice(0, 3).map((service: any) => (
                                                    <div
                                                        key={service.id}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="truncate">{service.name}</span>
                                                        <span className="font-semibold text-primary ml-2 whitespace-nowrap">
                                                            {service.price}₽
                                                        </span>
                                                    </div>
                                                ))}
                                                {activeServices.length > 3 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{activeServices.length - 3} еще...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Услуги скоро появятся
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <div className="mt-auto">
                                        <div className="w-full rounded-lg bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            Посмотреть и записаться →
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>© 2026 AI-Booking. Все права защищены.</p>
                </div>
            </footer>
        </div>
    );
}
