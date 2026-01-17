"use client";

import { useState } from "react";
import { deleteService } from "./actions";
import { useRouter } from "next/navigation";

export default function DeleteServiceButton({ serviceId }: { serviceId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Вы уверены, что хотите удалить эту услугу?")) {
            return;
        }

        setLoading(true);
        const result = await deleteService(serviceId);

        if (result.error) {
            alert(result.error);
            setLoading(false);
        } else {
            router.refresh();
        }
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md border px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
            {loading ? "..." : "Удалить"}
        </button>
    );
}
