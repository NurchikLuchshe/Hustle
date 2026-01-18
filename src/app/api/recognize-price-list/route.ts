import { NextRequest, NextResponse } from "next/server";
import { recognizePriceList } from "@/lib/ai/recognize-price-list";

export async function POST(request: NextRequest) {
    try {
        const { imageDataUrl } = await request.json();

        if (!imageDataUrl) {
            return NextResponse.json(
                { success: false, error: "Изображение не предоставлено" },
                { status: 400 }
            );
        }

        const result = await recognizePriceList(imageDataUrl);

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Ошибка сервера при обработке изображения",
            },
            { status: 500 }
        );
    }
}
