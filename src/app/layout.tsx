import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/frontend/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "AI-Booking | Умная запись для мастеров",
    template: "%s | AI-Booking",
  },
  description:
    "AI-секретарь для парикмахеров, массажистов и репетиторов. Автоматическая запись клиентов через Telegram и Instagram.",
  keywords: [
    "запись онлайн",
    "CRM для мастеров",
    "бот записи",
    "telegram бот",
    "парикмахер",
    "салон красоты",
  ],
  authors: [{ name: "AI-Booking" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://aibooking.me",
    siteName: "AI-Booking",
    title: "AI-Booking | Умная запись для мастеров",
    description:
      "AI-секретарь для автоматической записи клиентов через мессенджеры",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
