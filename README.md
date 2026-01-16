# AI-Booking

AI-powered платформа для автоматической записи клиентов к индивидуальным мастерам.

## Ключевые фичи

- **AI-секретарь** — понимает естественный язык ("запиши на пятницу после обеда")
- **Telegram бот** — клиенты записываются прямо в мессенджере
- **Instagram DM** — интеграция с директом (Phase 2)
- **Автонастройка** — распознавание прайс-листа по фото

## Технологический стек

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: OpenAI GPT-4o, pgvector для RAG
- **Интеграции**: Telegram Bot API, Instagram Graph API

## Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repo-url>
cd ai-booking
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env.local
```

Заполните `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_WEBHOOK_SECRET=random-secret
RESEND_API_KEY=re_...
```

### 3. Настройка Supabase

```bash
# Установка Supabase CLI
npm install -g supabase

# Логин
supabase login

# Связь с проектом
supabase link --project-ref <project-id>

# Применение миграций
supabase db push
```

### 4. Запуск локально

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 5. Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env.local`
3. Задеплойте Edge Function:
   ```bash
   supabase functions deploy telegram-webhook
   ```
4. Установите webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<FUNCTION_URL>?secret=<SECRET>"
   ```

## Структура проекта

```
/
├── docs/                    # Документация
│   ├── 01-TECHNICAL-SPECIFICATION.md
│   ├── 02-DATABASE-SCHEMA.sql
│   └── 03-PROJECT-ROADMAP.md
│
├── prompts/                 # AI промпты
│   ├── 01-AI-BOOKING-AGENT.md
│   ├── 02-ONBOARDING-VISION.md
│   └── 03-DEVELOPMENT-PROMPTS.md
│
├── src/
│   ├── frontend/           # Next.js приложение
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React компоненты
│   │   ├── lib/           # Утилиты
│   │   └── hooks/         # React hooks
│   │
│   ├── shared/            # Общий код
│   │   ├── types/         # TypeScript типы
│   │   ├── constants/     # Константы
│   │   ├── utils/         # Утилиты
│   │   └── validations/   # Zod схемы
│   │
│   └── bot/               # Telegram бот (локальная разработка)
│
├── supabase/
│   └── functions/         # Edge Functions
│       ├── _shared/       # Общие модули
│       └── telegram-webhook/
│
└── infrastructure/        # Docker, CI/CD
```

## Команды разработки

```bash
npm run dev          # Запуск dev сервера
npm run build        # Production сборка
npm run lint         # Проверка ESLint
npm run type-check   # Проверка TypeScript
npm run test         # Запуск тестов
npm run db:migrate   # Применение миграций
npm run db:types     # Генерация типов из БД
```

## Деплой

### Vercel (Frontend)

```bash
vercel
```

### Supabase Edge Functions

```bash
supabase functions deploy
```

## Этапы разработки

- [x] **Phase 1**: MVP — Dashboard, Telegram бот, Web-виджет
- [ ] **Phase 2**: Instagram интеграция, Telegram Business
- [ ] **Phase 3**: Мобильное приложение, WhatsApp

## Документация

- [Техническое задание](./docs/01-TECHNICAL-SPECIFICATION.md)
- [Схема БД](./docs/02-DATABASE-SCHEMA.sql)
- [Roadmap](./docs/03-PROJECT-ROADMAP.md)
- [AI Промпты](./prompts/)

## Лицензия

MIT
