import Link from "next/link";

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Ошибка подтверждения
                        </h1>
                        <p className="text-gray-600">
                            Не удалось подтвердить ваш email. Ссылка могла устареть или быть
                            использована ранее.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                        >
                            Вернуться на главную
                        </Link>
                        <Link
                            href="/auth/verify-email"
                            className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                            Отправить письмо повторно
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
