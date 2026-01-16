# Техническое Задание (ТЗ)
## AI-Booking: Экосистема AI-автоматизации для сферы услуг

**Версия:** 1.0
**Дата:** 2025-01-15
**Статус:** В разработке

---

## 1. Общее описание проекта

### 1.1 Название продукта
**AI-Booking** (рабочее название, может быть изменено)

### 1.2 Миссия
Освободить индивидуальных мастеров (парикмахеров, массажистов, репетиторов) от рутины администрирования, предоставив AI-секретаря, который ведёт естественный диалог с клиентами и управляет записью.

### 1.3 Ключевая проблема (Pain Point)
- Мастера теряют до 30% рабочего времени на переписку в мессенджерах
- Клиенты ожидают мгновенного ответа в привычных каналах (Telegram, Instagram)
- Существующие решения (YClients, Dikidi) — это "календари", а не "секретари"

### 1.4 Уникальное торговое предложение (UVP)
**"AI-секретарь, который понимает 'запиши меня на вечер пятницы' и сам находит свободное окно"**

---

## 2. Целевая аудитория

### 2.1 Первичная аудитория (B2B)
| Сегмент | Характеристики | Боль |
|---------|----------------|------|
| Соло-мастера | Парикмахеры, nail-мастера, массажисты | Нет времени отвечать всем в мессенджерах |
| Репетиторы | Преподаватели языков, музыки, IT | Сложно координировать расписание с 20+ учениками |
| Фрилансеры | Фотографы, визажисты | Хаотичные запросы в разных каналах |

### 2.2 Вторичная аудитория (B2C)
- Клиенты мастеров, которые хотят записаться быстро и без регистрации

---

## 3. Функциональные требования

### 3.1 MVP (Минимально жизнеспособный продукт) — Фаза 1

#### 3.1.1 Веб-приложение для мастера (Vendor Dashboard)
- [ ] Регистрация/авторизация (email + magic link)
- [ ] Онбординг с AI-распознаванием прайс-листа (фото → JSON)
- [ ] Управление услугами (CRUD)
- [ ] Календарь с визуализацией записей
- [ ] Настройка рабочего графика (дни, часы, перерывы)
- [ ] Просмотр клиентской базы
- [ ] Генерация QR-кода для записи

#### 3.1.2 Telegram Bot (Агрегатор)
- [ ] Бот @AIBookingBot с командой /start vendor_slug
- [ ] Диалоговый AI для записи на услугу
- [ ] Проверка доступных слотов (Function Calling)
- [ ] Создание бронирования
- [ ] Напоминания о визите (за 24ч, за 2ч)
- [ ] Отмена/перенос записи

#### 3.1.3 Веб-виджет для клиентов
- [ ] Страница записи по ссылке (book.aibooking.me/slug)
- [ ] Выбор услуги → выбор даты → выбор времени
- [ ] Ввод телефона + OTP верификация
- [ ] Подтверждение записи

### 3.2 Версия 2.0 — Фаза 2

#### 3.2.1 Telegram Business Integration
- [ ] Подключение бота к личному аккаунту мастера
- [ ] Ответы от имени мастера
- [ ] Передача диалога мастеру при сложных вопросах

#### 3.2.2 Instagram Integration
- [ ] OAuth через Facebook Business
- [ ] Обработка сообщений из Instagram Direct
- [ ] AI-ответы на вопросы о ценах/услугах

#### 3.2.3 Расширенная аналитика
- [ ] Статистика записей (конверсия, источники)
- [ ] Отчёты по доходам
- [ ] Анализ пиковых часов

### 3.3 Версия 3.0 — Фаза 3
- [ ] WhatsApp Business API
- [ ] Онлайн-оплата депозита
- [ ] Программа лояльности (бонусы)
- [ ] Реферальная система
- [ ] Мобильное приложение для мастера

---

## 4. Нефункциональные требования

### 4.1 Производительность
- Время ответа API: < 200ms (p95)
- Время ответа AI: < 3s
- Uptime: 99.9%

### 4.2 Масштабируемость
- Архитектура: Multi-tenant SaaS
- Поддержка до 100,000 мастеров
- До 1,000,000 бронирований/месяц

### 4.3 Безопасность
- Row Level Security (RLS) в PostgreSQL
- Шифрование данных at rest и in transit
- GDPR compliance (право на удаление)
- Верификация телефона через OTP

### 4.4 Локализация
- Языки: Русский, Английский, Узбекский
- Часовые пояса: динамически по настройке мастера
- Валюты: RUB, USD, UZS

---

## 5. Технический стек

### 5.1 Frontend
```
Framework:     Next.js 14 (App Router)
Styling:       Tailwind CSS + shadcn/ui
State:         Zustand / TanStack Query
Forms:         React Hook Form + Zod
Calendar:      FullCalendar или кастомный
```

### 5.2 Backend
```
Runtime:       Supabase Edge Functions (Deno)
Database:      PostgreSQL (Supabase)
Vector Store:  pgvector (RAG для AI)
Auth:          Supabase Auth
Storage:       Supabase Storage (фото)
Realtime:      Supabase Realtime (уведомления)
```

### 5.3 AI/ML
```
LLM:           OpenAI GPT-4o (диалог + vision)
Embeddings:    text-embedding-3-small
Function Calling: OpenAI Tools API
Fallback:      Claude 3.5 Sonnet (backup)
```

### 5.4 Integrations
```
Telegram:      Bot API + Business API
Instagram:     Graph API (Messenger)
SMS:           Twilio / SMS.ru
Payments:      Stripe / YooKassa
```

### 5.5 Infrastructure
```
Hosting:       Vercel (Frontend)
Edge:          Supabase Edge Functions
CDN:           Cloudflare
Monitoring:    Sentry + Supabase Dashboard
CI/CD:         GitHub Actions
```

---

## 6. Архитектура системы

### 6.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│  Telegram   │  Instagram  │  Web Widget │  Vendor Dashboard       │
│    Bot      │    DM       │  (Next.js)  │    (Next.js)            │
└──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────────┘
       │             │             │                  │
       ▼             ▼             ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Edge Functions)                  │
├─────────────────────────────────────────────────────────────────┤
│  /webhook/telegram  │  /webhook/instagram  │  /api/*             │
└──────────┬──────────┴──────────┬───────────┴─────────┬───────────┘
           │                     │                      │
           ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATOR                             │
├─────────────────────────────────────────────────────────────────┤
│  Intent Detection  │  Function Calling  │  Response Generation  │
└──────────┬─────────┴─────────┬──────────┴─────────┬──────────────┘
           │                   │                     │
           ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  BookingService  │  CalendarService  │  ClientService            │
└──────────┬───────┴─────────┬─────────┴─────────┬─────────────────┘
           │                 │                    │
           ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│  vendors  │  services  │  bookings  │  clients  │  embeddings    │
│           │            │            │           │  (pgvector)    │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow: Telegram Booking
```
1. Client → Telegram: "Хочу на стрижку в пятницу"
2. Telegram → Webhook: POST /webhook/telegram
3. Webhook → AI Orchestrator: {message, vendor_id, history}
4. AI → Function Call: check_availability(service="стрижка", date="friday")
5. Function → DB: SELECT available_slots(...)
6. DB → Function: ["18:00", "19:30"]
7. AI → Response: "Есть окна в 18:00 и 19:30. Какое выберете?"
8. Webhook → Telegram: sendMessage(response)
```

---

## 7. Структура базы данных

### 7.1 ER-диаграмма (основные сущности)
```
vendors ─────────┬───────────────┬───────────────┐
    │            │               │               │
    ▼            ▼               ▼               ▼
services      clients        bookings      work_schedules
    │            │               │
    │            │               │
    └────────────┴───────────────┘
```

### 7.2 Таблицы (подробно см. schema.sql)
- `vendors` — мастера/салоны
- `services` — услуги с ценами и длительностью
- `clients` — клиенты (телефон, telegram_id)
- `bookings` — бронирования
- `work_schedules` — рабочий график
- `conversations` — история диалогов для AI
- `embeddings` — векторы для RAG

---

## 8. API Endpoints

### 8.1 REST API (для Dashboard)
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/vendor/profile
PUT    /api/vendor/profile
GET    /api/services
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id
GET    /api/bookings
POST   /api/bookings
PUT    /api/bookings/:id/status
GET    /api/clients
GET    /api/analytics
```

### 8.2 Webhooks
```
POST   /webhook/telegram
POST   /webhook/instagram
POST   /webhook/stripe
```

### 8.3 Public API (для виджета)
```
GET    /public/:slug/services
GET    /public/:slug/slots?date=YYYY-MM-DD&service_id=xxx
POST   /public/:slug/book
POST   /public/verify-otp
```

---

## 9. Бизнес-модель

### 9.1 Тарифные планы

| План | Цена | Записей | AI-диалогов | Каналы |
|------|------|---------|-------------|--------|
| Start | $0/мес | 50 | 0 | Web-виджет |
| Pro | $19/мес | ∞ | 500 | Web + Telegram |
| Business | $49/мес | ∞ | 2000 | + Instagram + TG Business |

### 9.2 Дополнительные пакеты
- AI Pack: $10 за 1000 диалогов
- SMS Pack: $5 за 100 SMS

---

## 10. Этапы разработки

### Фаза 1: MVP (8-10 недель)
- Неделя 1-2: Инфраструктура, БД, Auth
- Неделя 3-4: Backend API, бизнес-логика
- Неделя 5-6: Vendor Dashboard (UI)
- Неделя 7-8: Telegram Bot + AI
- Неделя 9-10: Тестирование, деплой

### Фаза 2: Расширение (6-8 недель)
- Instagram интеграция
- Telegram Business
- Платежи

### Фаза 3: Масштабирование (ongoing)
- WhatsApp
- Мобильное приложение
- Маркетплейс мастеров

---

## 11. Метрики успеха (KPI)

### 11.1 Product Metrics
- Регистрации мастеров: 100/месяц (первый квартал)
- Активные мастера (MAU): 60%
- Бронирований через AI: 70%

### 11.2 Business Metrics
- Конверсия Free → Paid: 10%
- Churn rate: < 5%
- LTV/CAC ratio: > 3

---

## 12. Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Отказ Instagram API модерации | Высокая | Высокое | Начать с Telegram, подать заявку заранее |
| Высокие расходы на AI | Средняя | Среднее | Лимиты на тарифах, кэширование ответов |
| Низкая конверсия в платные | Средняя | Высокое | A/B тесты, продуктовые интервью |

---

## Приложения

- [A] Схема БД (SQL) — см. `/docs/database-schema.sql`
- [B] AI Prompts — см. `/prompts/`
- [C] Wireframes — см. `/docs/wireframes/`
- [D] Конкурентный анализ — см. раздел 2 исходного документа
