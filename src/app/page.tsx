import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">AI-Booking</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Начать бесплатно</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              AI-секретарь для{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                вашего бизнеса
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Автоматическая запись клиентов через Telegram и Instagram.
              Нейросеть понимает &quot;запиши на пятницу после обеда&quot; и
              сама находит свободное время.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px]">
                Попробовать бесплатно
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                Как это работает
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-muted-foreground">Бот отвечает всегда</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">30%</div>
              <div className="text-muted-foreground">Экономия времени</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">0</div>
              <div className="text-muted-foreground">Пропущенных клиентов</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Почему мастера выбирают нас
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="Умный AI"
              description="Понимает естественную речь. Клиент пишет 'хочу завтра вечером' — бот сам предложит свободные окна."
              icon="brain"
            />
            <FeatureCard
              title="Мессенджеры"
              description="Telegram и Instagram. Клиенты записываются там, где им удобно — без регистрации и паролей."
              icon="message"
            />
            <FeatureCard
              title="Без настройки"
              description="Пришлите фото прайса — AI сам распознает услуги и цены. Запуск за 5 минут."
              icon="zap"
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="container py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">Тарифы</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              name="Start"
              price="0"
              description="Для начала работы"
              features={[
                "50 записей в месяц",
                "Веб-виджет",
                "Календарь",
                "QR-код",
              ]}
            />
            <PricingCard
              name="Pro"
              price="19"
              description="Для активных мастеров"
              features={[
                "Безлимит записей",
                "Telegram бот с AI",
                "500 AI-диалогов",
                "Напоминания клиентам",
                "Аналитика",
              ]}
              highlighted
            />
            <PricingCard
              name="Business"
              price="49"
              description="Максимум возможностей"
              features={[
                "Всё из Pro",
                "Instagram интеграция",
                "Telegram Business",
                "2000 AI-диалогов",
                "Приоритетная поддержка",
              ]}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            2024 AI-Booking. Все права защищены.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/terms">Условия использования</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "brain" | "message" | "zap";
}) {
  const icons = {
    brain: (
      <svg
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    message: (
      <svg
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    zap: (
      <svg
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  };

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-4 text-primary">{icons[icon]}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${highlighted ? "border-primary ring-2 ring-primary" : ""
        }`}
    >
      {highlighted && (
        <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
          Популярный
        </span>
      )}
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="my-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/месяц</span>
      </div>
      <ul className="mb-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/register">
        <Button className="w-full" variant={highlighted ? "default" : "outline"}>
          Выбрать
        </Button>
      </Link>
    </div>
  );
}
