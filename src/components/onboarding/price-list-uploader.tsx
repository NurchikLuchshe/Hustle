"use client";

import { useState } from "react";
import { Upload, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecognizedService {
    name: string;
    price: number;
    price_type: "fixed" | "from" | "range";
    price_max?: number;
    duration_minutes: number;
    category: string;
    description?: string;
}

interface PriceListUploaderProps {
    onServicesRecognized: (services: RecognizedService[]) => void;
}

export function PriceListUploader({
    onServicesRecognized,
}: PriceListUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");
    const [preview, setPreview] = useState<string>("");

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Пожалуйста, загрузите изображение");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Файл слишком большой. Максимум 5MB");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setPreview(base64);

                try {
                    // Call API to recognize
                    const response = await fetch("/api/recognize-price-list", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ imageDataUrl: base64 }),
                    });

                    const result = await response.json();

                    if (result.success && result.services) {
                        onServicesRecognized(result.services);
                    } else {
                        setError(
                            result.error || "Не удалось распознать прайс-лист"
                        );
                    }
                } catch (error) {
                    setError("Ошибка при обработке изображения");
                    console.error(error);
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setError("Ошибка при загрузке файла");
            setIsUploading(false);
        }
    }

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="price-list-upload"
                    disabled={isUploading}
                />
                <label
                    htmlFor="price-list-upload"
                    className="cursor-pointer block"
                >
                    {isUploading ? (
                        <div className="space-y-3">
                            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Анализирую изображение...
                            </p>
                        </div>
                    ) : preview ? (
                        <div className="space-y-3">
                            <Check className="h-12 w-12 mx-auto text-green-600" />
                            <p className="text-sm font-medium">
                                Прайс-лист распознан!
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPreview("");
                                    setError("");
                                }}
                            >
                                Загрузить другое фото
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                                <p className="font-medium">
                                    Загрузите фото прайс-листа
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    AI автоматически распознает услуги и цены
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm">
                                Выбрать файл
                            </Button>
                        </div>
                    )}
                </label>
            </div>

            {/* Preview */}
            {preview && (
                <div className="relative rounded-lg overflow-hidden border">
                    <img
                        src={preview}
                        alt="Price list preview"
                        className="w-full max-h-64 object-contain bg-muted"
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-lg bg-destructive/10 p-3 flex items-start gap-2 text-sm text-destructive">
                    <X className="h-4 w-4 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-primary/5 p-4 text-sm">
                <p className="font-medium mb-2">💡 Советы:</p>
                <ul className="space-y-1 text-muted-foreground">
                    <li>• Убедитесь что фото четкое и хорошо освещено</li>
                    <li>• Текст должен быть читаемым</li>
                    <li>• Поддерживаются форматы: JPG, PNG, HEIC</li>
                </ul>
            </div>
        </div>
    );
}
