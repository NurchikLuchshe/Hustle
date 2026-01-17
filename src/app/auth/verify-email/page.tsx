"use client";

import { useState } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "./actions";

export default function VerifyEmailPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    async function handleResend(e: React.FormEvent) {
        e.preventDefault();
        if (!email) {
            setMessage("Введите ваш email");
            return;
        }

        setLoading(true);
        setMessage("");

        const result = await resendVerificationEmail(email);

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage("✅ Письмо отправлено! Проверьте вашу почту.");
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                            <svg
                                className="w-8 h-8 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-2">
                            Подтвердите email
                        </h1>
                        <p className="text-gray-600">
                            Мы отправили письмо с подтверждением. Проверьте вашу почту и
                            перейдите по ссылке.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Совет:</strong> Проверьте папку "Спам", если письмо не
                            пришло в течение 5 минут.
                        </p>
                    </div>

                    <form onSubmit={handleResend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                required
                            />
                        </div>

                        {message && (
                            <div
                                className={`p-3 rounded-lg text-sm ${message.includes("✅")
                                        ? "bg-green-50 text-green-800 border border-green-200"
                                        : "bg-red-50 text-red-800 border border-red-200"
                                    }`}
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                        >
                            {loading ? "Отправка..." : "Отправить письмо повторно"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-purple-600 hover:underline text-sm">
                            ← Вернуться на главную
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
