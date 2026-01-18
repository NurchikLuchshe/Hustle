"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navigation({ isAuthenticated }: { isAuthenticated: boolean }) {
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Главная" },
        { href: "/explore", label: "Найти мастера" },
    ];

    const links = [
        { href: "/dashboard", label: "Главная", icon: "home" },
        { href: "/dashboard/calendar", label: "Календарь", icon: "calendar" },
        { href: "/dashboard/services", label: "Услуги", icon: "briefcase" },
        { href: "/dashboard/clients", label: "Клиенты", icon: "users" },
        { href: "/dashboard/settings", label: "Настройки", icon: "settings" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold gradient-text">AI-Booking</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <nav className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <Link href="/dashboard">
                            <Button>Кабинет</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Войти</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Начать бесплатно</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
