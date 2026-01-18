# AI-Booking - Автоматизация записи клиентов с AI

AI-powered платформа для автоматической записи клиентов к индивидуальным мастерам (парикмахеры, массажисты, косметологи, репетиторы).

## 🚀 Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/NurchikLuchshe/Hustle.git
cd Hustle

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
cp .env.example .env.local
# Отредактируйте .env.local (см. раздел "Настройка")

# 4. Запустить dev сервер
npm run dev
```

Откройте http://localhost:3000

---

## 📁 Структура проекта

```
Hustle/
├── docs/                          # Документация
│   ├── 01-TECHNICAL-SPECIFICATION.md
│   ├── 02-DATABASE-SCHEMA.sql     # SQL схема БД
│   └── 03-PROJECT-ROADMAP.md
│
├── prompts/                       # AI промпты
│   ├── 01-AI-BOOKING-AGENT.md     # System prompt для бота
│   ├── 02-ONBOARDING-VISION.md    # GPT-4 Vision для прайсов
│   └── 03-DEVELOPMENT-PROMPTS.md
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── calendar/         # Календарь записей
│   │   │   ├── services/         # CRUD услуг
│   │   │   ├── clients/          # Управление клиентами
│   │   │   ├── settings/         # Настройки профиля/графика
│   │   │   ├── bookings/new/     # Ручное создание записи
│   │   │   └── qr-code/          # Генератор QR-кодов
│   │   ├── [slug]/               # Публичная страница записи
│   │   ├── api/                  # API routes
│   │   └── auth/callback/        # OAuth callback
│   │
│   ├── components/
│   │   ├── ui/                   # UI компоненты (shadcn-style)
│   │   ├── onboarding/           # Onboarding wizard
│   │   └── qr-code-generator.tsx
│   │
│   ├── lib/
│   │   ├── supabase/             # Supabase clients
│   │   ├── ai/                   # AI services (GPT-4 Vision)
│   │   ├── email.ts              # Email service
│   │   └── utils.ts
│   │
│   └── shared/
│       ├── types/                # TypeScript types
│       │   ├── database.types.ts # Auto-generated от Supabase
│       │   └── api.types.ts
│       ├── validations/          # Zod schemas
│       ├── constants/            # Константы
│       └── utils/                # Утилиты
│
├── supabase/
│   ├── migrations/               # SQL миграции
│   │   └── 20260116_initial_schema.sql
│   └── functions/                # Edge Functions (Deno)
│       ├── _shared/              # Общий код
│       └── telegram-webhook/     # Telegram bot webhook
│
├── .env.local                    # Локальные переменные (НЕ в git!)
├── .env.example                  # Шаблон переменных
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗄️ База данных (PostgreSQL + Supabase)

### Таблицы

1. **vendors** - Профили мастеров
2. **services** - Услуги (стрижки, массаж и т.д.)
3. **clients** - Клиенты
4. **bookings** - Записи/бронирования
5. **work_schedules** - Рабочий график мастеров
6. **conversations** - Диалоги с AI ботом
7. **messages** - Сообщения в диалогах
8. **embeddings** - Vector embeddings для RAG
9. **notifications** - Уведомления
10. **payments** - Платежи
11. **analytics_events** - Аналитика

### Применение схемы БД

**Вариант 1: Через Supabase CLI**
```bash
# 1. Установить Supabase CLI
npm install -g supabase

# 2. Логин
supabase login

# 3. Связать с проектом
supabase link --project-ref jcczperyfdjwvcjiqrvj

# 4. Применить миграции
supabase db push
```

**Вариант 2: Вручную через Dashboard**
1. Перейти в https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj/sql/new
2. Скопировать содержимое `docs/02-DATABASE-SCHEMA.sql`
3. Выполнить SQL

---

## ⚙️ Настройка переменных окружения

Создайте `.env.local` в корне проекта:

```env
# ============ SUPABASE ============
NEXT_PUBLIC_SUPABASE_URL=https://jcczperyfdjwvcjiqrvj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ваш anon key>
SUPABASE_SERVICE_ROLE_KEY=<ваш service role key>

# ============ OPENAI ============
OPENAI_API_KEY=sk-...  # Для AI-распознавания прайсов и бота

# ============ TELEGRAM ============
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_WEBHOOK_SECRET=random_secret_string

# ============ APP ============
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AI-Booking

# ============ EMAIL (Resend) ============
RESEND_API_KEY=re_...
```

### Где взять ключи:

**Supabase:**
1. https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj/settings/api
2. Скопировать `Project URL` и оба ключа

**OpenAI:**
1. https://platform.openai.com/api-keys
2. Создать новый API key

**Telegram:**
1. Написать @BotFather в Telegram
2. Команда `/newbot`
3. Скопировать токен

---

## 🏗️ Технологический стек

### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui компоненты
- **React Hook Form** + Zod валидация

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Next.js API Routes**
- **Deno** (для Edge Functions)

### AI/ML
- **OpenAI GPT-4o** - conversational AI
- **GPT-4 Vision** - распознавание прайс-листов
- **pgvector** - RAG (Retrieval Augmented Generation)

### Integrations
- **Telegram Bot API**
- **Resend** (email)
- *Instagram DM* (планируется)

---

## 🔐 Аутентификация

Использует **Supabase Auth**:
- Email + Password (с автоподтверждением через Admin API)
- OAuth (Google) - опционально
- Magic Links - опционально

**RLS (Row Level Security)** включен для всех таблиц.

---

## 📱 Основные функции

### ✅ Реализовано (Sprint 1-2)

1. **Auth System**
   - Регистрация/вход
   - Защищенные маршруты

2. **Vendor Dashboard**
   - Управление услугами (CRUD)
   - Календарь записей
   - База клиентов
   - Настройки профиля и графика
   - Ручное создание записей
   - QR-код генератор

3. **Публичная страница записи**
   - `/{slug}` - страница для клиентов
   - Выбор услуги и времени
   - Бронирование слотов

4. **AI Features**
   - GPT-4 Vision для распознавания прайс-листов
   - API endpoint `/api/recognize-price-list`

### 🚧 В разработке (Sprint 3)

- **Telegram Bot** с AI
- **AI Orchestrator** для natural language
- **Function Calling** (check_availability, create_booking)

### 📋 Запланировано

- Instagram DM integration
- SMS уведомления
- Платежи (Stripe/YooKassa)
- Аналитика

---

## 🧪 Разработка

### Команды

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Code quality
npm run lint
npm run lint:fix
npm run type-check

# Testing
npm run test
npm run test:coverage

# Database
npm run db:migrate      # Применить миграции
npm run db:reset        # Сброс БД (локально)
npm run db:types        # Сгенерировать типы
```

### Рекомендации

- Используйте **TypeScript** везде
- **Zod** для валидации
- **Server Actions** для мутаций
- **Server Components** по умолчанию, Client - только где нужно
- **RLS first** - все данные защищены на уровне БД

---

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
# 1. Push в GitHub
git push origin main

# 2. Импорт в Vercel
# https://vercel.com/new

# 3. Добавить переменные из .env.local
# Vercel Dashboard → Settings → Environment Variables

# 4. Deploy!
```

### После первого деплоя:
1. Обновить `NEXT_PUBLIC_APP_URL` на Vercel URL
2. В Supabase → Auth → URL Configuration добавить:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- Пользователь не зарегистрирован
- Перейдите на `/register`

### База данных пустая
- Применить миграции: `npm run db:migrate`
- Или вручную через Supabase Dashboard

### TypeScript ошибки
```bash
npm run db:types  # Пересоздать типы БД
npm run type-check
```

### Next.js не собирается
```bash
rm -rf .next
npm run build
```

---

## 📊 Текущий прогресс

- ✅ **Sprint 1** - Foundation (100%)
- ✅ **Sprint 2** - Vendor Dashboard (95%)
- 🚧 **Sprint 3** - Telegram Bot (0%)

**MVP готов к тестированию!**

---

## 📞 Контакты и поддержка

- GitHub: https://github.com/NurchikLuchshe/Hustle
- Документация проекта: `/docs`
- AI промпты: `/prompts`

---

## 📄 Лицензия

Проприетарный код. Все права защищены.
