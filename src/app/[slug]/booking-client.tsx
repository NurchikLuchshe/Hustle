"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import BookingModal from "./booking-modal";

interface Vendor {
    id: string;
    business_name: string;
    slug: string;
    description: string | null;
    address: string | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    category: string | null;
}

export default function BookingPageClient({
    vendor,
    services,
    isVendorOwner = false,
}: {
    vendor: Vendor;
    services: Service[];
    isVendorOwner?: boolean;
}) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Vendor Quick Access */}
            {isVendorOwner && (
                <div className="fixed top-4 right-4 z-50">
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Dashboard
                    </a>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        {vendor.business_name}
                    </h1>
                    {vendor.description && (
                        <p className="text-xl text-muted-foreground mb-6">
                            {vendor.description}
                        </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>4.9 (127 отзывов)</span>
                        </div>
                        {vendor.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{vendor.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8">Наши услуги</h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="premium-card group rounded-xl border bg-card p-6 hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => setSelectedService(service)}
                            >
                                {/* Service Icon/Image */}
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl">
                                        {getCategoryIcon(service.category)}
                                    </span>
                                </div>

                                {/* Service Info */}
                                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                                {service.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {service.description}
                                    </p>
                                )}

                                {/* Price & Duration */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-2xl font-bold gradient-text">
                                        {service.price}₽
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{service.duration_minutes} мин</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                    Записаться
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {selectedService && (
                <BookingModal
                    vendor={vendor}
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}

            {/* Footer */}
            <footer className="py-8 px-4 border-t mt-12">
                <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2024 {vendor.business_name}</p>
                    <p className="mt-1">
                        Powered by{" "}
                        <span className="font-medium gradient-text">AI-Booking</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}

function getCategoryIcon(category: string | null): string {
    const icons: Record<string, string> = {
        haircut: "✂️",
        nails: "💅",
        massage: "💆",
        beauty: "💄",
        medical: "🏥",
        fitness: "💪",
        other: "⭐",
    };
    return icons[category || "other"] || "⭐";
}
