"use client";

import { Download, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QRCodeGeneratorProps {
    slug: string;
    businessName: string;
}

export function QRCodeGenerator({ slug, businessName }: QRCodeGeneratorProps) {
    const [copied, setCopied] = useState(false);

    const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${slug}`;

    // Using QR Server API for QR code generation (no npm install needed!)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`;
    const qrCodeUrlHD = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(bookingUrl)}`;

    function copyUrl() {
        navigator.clipboard.writeText(bookingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function downloadQR() {
        const link = document.createElement("a");
        link.download = `${slug}-qr-code.png`;
        link.href = qrCodeUrlHD;
        link.target = "_blank";
        link.click();
    }

    async function shareQR() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `QR код - ${businessName}`,
                    text: `Запишитесь онлайн: ${bookingUrl}`,
                    url: bookingUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
                copyUrl();
            }
        } else {
            copyUrl();
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                    QR-код для записи
                </h3>

                <div className="flex flex-col items-center space-y-4">
                    {/* QR Code */}
                    <div className="rounded-lg border bg-white p-4">
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-[300px] h-[300px]"
                        />
                    </div>

                    {/* URL */}
                    <div className="text-center w-full">
                        <p className="text-sm text-muted-foreground mb-2">
                            Ваша ссылка для записи:
                        </p>
                        <div className="flex items-center gap-2 justify-center bg-muted rounded-lg p-3">
                            <a
                                href={bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline truncate"
                            >
                                {bookingUrl}
                            </a>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyUrl}
                                className="shrink-0"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        {copied && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Скопировано!
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadQR}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Скачать HD
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareQR}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Поделиться
                        </Button>
                    </div>
                </div>
            </div>

            {/* Usage Tips */}
            <div className="rounded-lg bg-primary/5 p-4 text-sm">
                <p className="font-medium mb-2">💡 Как использовать:</p>
                <ul className="space-y-1 text-muted-foreground">
                    <li>• Распечатайте и разместите в салоне/студии</li>
                    <li>• Добавьте в визитки и флаеры</li>
                    <li>• Разместите в Instagram Stories</li>
                    <li>• Отправьте клиентам в WhatsApp/Telegram</li>
                </ul>
            </div>
        </div>
    );
}
