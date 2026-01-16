import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Simple header */}
            <header className="border-b bg-background/80 backdrop-blur">
                <div className="container flex h-16 items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold gradient-text">AI-Booking</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t py-6 bg-background/50">
                <div className="container text-center text-sm text-muted-foreground">
                    © 2024 AI-Booking. Умная запись для мастеров.
                </div>
            </footer>
        </div>
    );
}
