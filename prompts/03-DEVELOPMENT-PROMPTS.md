# Промпты для AI-разработчиков

## Для Claude Code, Cursor, Windsurf, Gemini

---

## 1. MASTER PROMPT (Основной контекст проекта)

Используй этот промпт в начале каждой сессии разработки:

```markdown
# Проект: AI-Booking

## Описание
AI-powered платформа для записи клиентов к индивидуальным мастерам (парикмахеры, массажисты, репетиторы). Ключевая фича — AI-секретарь, который ведёт естественный диалог в Telegram/Instagram и автоматически управляет записями.

## Архитектура
- **Multi-tenant SaaS** — все мастера на одной платформе с RLS-изоляцией
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **AI**: OpenAI GPT-4o с Function Calling, pgvector для RAG
- **Integrations**: Telegram Bot API, Instagram Graph API

## Структура проекта
```
/src
  /frontend          # Next.js приложение
    /app             # App Router pages
    /components      # UI компоненты
    /lib             # Утилиты, API клиенты
    /hooks           # React hooks
  /backend           # Supabase Edge Functions
    /functions       # Edge Functions
    /shared          # Общие типы и утилиты
  /bot               # Telegram/Instagram обработчики
  /shared            # Общие типы между frontend/backend
```

## Ключевые принципы
1. **Type Safety** — TypeScript везде, Zod для валидации
2. **RLS First** — Все запросы через Supabase клиент с RLS
3. **AI Reliability** — Никаких галлюцинаций, только данные из БД
4. **Mobile First** — Мастера управляют с телефона

## Текущая фаза: MVP
- Веб-дашборд для мастера
- Telegram бот с AI
- Веб-виджет для клиентов
```

---

## 2. FRONTEND PROMPTS

### 2.1 Создание компонентов

```markdown
Создай React-компонент для [ОПИСАНИЕ].

Требования:
- Next.js 14 (App Router, Server Components где возможно)
- TypeScript с явными типами
- Tailwind CSS + shadcn/ui для стилей
- Responsive design (mobile-first)
- Доступность (a11y): правильные aria-атрибуты

Структура файла:
- Типы в начале файла
- Компонент с именованным экспортом
- Подкомпоненты в том же файле если они маленькие

Пример структуры:
```tsx
// src/frontend/components/[component-name].tsx

import { ... } from "@/components/ui/..."

interface ComponentProps {
  // ...
}

export function ComponentName({ ... }: ComponentProps) {
  return (...)
}
```
```

### 2.2 Создание страницы

```markdown
Создай страницу [НАЗВАНИЕ] для дашборда мастера.

Контекст:
- Next.js App Router
- Путь: /app/(dashboard)/[route]/page.tsx
- Данные загружаются через Server Components или TanStack Query
- Supabase клиент для авторизованных запросов

Структура:
1. page.tsx — серверный компонент, загрузка данных
2. _components/ — клиентские компоненты страницы
3. loading.tsx — скелетон загрузки
4. error.tsx — обработка ошибок

Не забудь:
- Проверку авторизации
- SEO метаданные
- Breadcrumbs если нужно
```

### 2.3 Формы

```markdown
Создай форму для [ОПИСАНИЕ].

Стек:
- react-hook-form для управления формой
- zod для валидации схемы
- shadcn/ui компоненты (Form, Input, Button, etc.)
- Server Actions или useMutation для отправки

Требования:
- Валидация на клиенте И сервере
- Показ ошибок под полями
- Состояния: idle, loading, success, error
- Оптимистичные обновления где применимо

Структура:
```tsx
const formSchema = z.object({...})

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {...}
  })

  async function onSubmit(values) {...}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        ...
      </form>
    </Form>
  )
}
```
```

---

## 3. BACKEND PROMPTS

### 3.1 Edge Function

```markdown
Создай Supabase Edge Function для [ОПИСАНИЕ].

Требования:
- Deno runtime (не Node.js!)
- TypeScript
- CORS headers для браузерных запросов
- Обработка ошибок с правильными HTTP кодами
- Логирование для отладки

Структура:
```typescript
// supabase/functions/[function-name]/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Логика здесь

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
```

Важно:
- Используй SUPABASE_SERVICE_ROLE_KEY для обхода RLS (только в Edge Functions!)
- Всегда проверяй входные данные через Zod
- Не забудь про rate limiting для публичных эндпоинтов
```

### 3.2 Database Query

```markdown
Напиши SQL-запрос/функцию для [ОПИСАНИЕ].

Контекст:
- PostgreSQL (Supabase)
- RLS включён, vendor_id — ключ изоляции
- Таймзоны: храним в UTC, конвертируем при отображении

Требования:
- Эффективное использование индексов
- Обработка NULL значений
- Комментарии для сложной логики

Если это функция:
```sql
CREATE OR REPLACE FUNCTION function_name(
  p_param1 TYPE,
  p_param2 TYPE
)
RETURNS TABLE (column1 TYPE, column2 TYPE)
LANGUAGE plpgsql
SECURITY DEFINER -- или INVOKER в зависимости от логики
AS $$
BEGIN
  -- Логика
  RETURN QUERY SELECT ...;
END;
$$;
```
```

---

## 4. AI/BOT PROMPTS

### 4.1 Telegram Webhook Handler

```markdown
Создай обработчик Telegram webhook для [СЦЕНАРИЙ].

Контекст:
- Supabase Edge Function
- Telegram Bot API
- Интеграция с OpenAI для AI-ответов

Структура обработки:
1. Валидация webhook (секретный токен)
2. Парсинг Update объекта
3. Определение vendor_id по chat/business_connection
4. Загрузка контекста диалога (последние N сообщений)
5. Вызов AI Orchestrator
6. Обработка Function Calls (если есть)
7. Отправка ответа в Telegram
8. Сохранение сообщений в БД

Типы Telegram:
```typescript
interface TelegramUpdate {
  update_id: number
  message?: Message
  callback_query?: CallbackQuery
  business_message?: Message
  business_connection?: BusinessConnection
}

interface Message {
  message_id: number
  from: User
  chat: Chat
  date: number
  text?: string
  voice?: Voice
  contact?: Contact
}
```
```

### 4.2 AI Orchestrator

```markdown
Создай AI Orchestrator — сервис для обработки диалогов с клиентами.

Архитектура:
```
Input (message, vendor_id, conversation_history)
  ↓
Context Builder
  - Vendor settings (name, timezone, personality)
  - Services list (for context)
  - Recent messages (last 10)
  ↓
OpenAI Chat Completion (with tools)
  ↓
Tool Executor (if function_call)
  - check_availability → DB query
  - create_booking → DB insert
  - get_services → DB query with RAG
  ↓
Response Generator
  ↓
Output (response_text, actions_taken)
```

Требования:
- Токен-оптимизация: не передавай лишний контекст
- Fallback на шаблонные ответы при ошибке API
- Логирование всех запросов для отладки
- Подсчёт использованных токенов для биллинга

Интерфейс:
```typescript
interface AIRequest {
  vendorId: string
  conversationId: string
  message: string
  platform: 'telegram' | 'instagram' | 'web'
}

interface AIResponse {
  text: string
  toolsCalled: ToolCall[]
  tokensUsed: number
  shouldHandoff: boolean // Передать живому мастеру
}
```
```

### 4.3 Function Executor

```markdown
Реализуй исполнитель функций (tools) для AI-агента.

Функции:
1. `get_services` — список услуг с ценами
2. `check_availability` — свободные слоты
3. `create_booking` — создание записи
4. `cancel_booking` — отмена
5. `reschedule_booking` — перенос

Каждая функция:
- Принимает типизированные параметры
- Выполняет запрос к Supabase
- Возвращает структурированный результат
- Обрабатывает ошибки gracefully

Пример:
```typescript
const tools: Record<string, ToolExecutor> = {
  check_availability: async ({ vendorId, serviceId, date, timePreference }) => {
    const slots = await supabase.rpc('get_available_slots', {
      p_vendor_id: vendorId,
      p_service_id: serviceId,
      p_date: date
    })

    if (slots.error) {
      return { error: 'Не удалось проверить расписание' }
    }

    // Фильтр по времени дня
    const filtered = filterByTimePreference(slots.data, timePreference)

    return {
      available_slots: filtered.map(s => formatTime(s.slot_time)),
      date: date
    }
  }
}
```
```

---

## 5. INTEGRATION PROMPTS

### 5.1 Instagram Graph API

```markdown
Создай интеграцию с Instagram Graph API для обработки Direct Messages.

Контекст:
- Требуется бизнес-аккаунт Instagram, связанный с Facebook Page
- OAuth через Facebook Login for Business
- Permissions: instagram_manage_messages, pages_messaging

Компоненты:
1. OAuth Flow (получение access_token)
2. Webhook setup (подписка на события)
3. Message handler (обработка входящих)
4. Send message (отправка ответов)

Важные ограничения:
- Rate limits: 200 calls per user per hour
- Token refresh: каждые 60 дней
- Media messages: отдельная обработка

Структура:
```typescript
class InstagramIntegration {
  constructor(private accessToken: string, private pageId: string) {}

  async handleWebhook(event: IGWebhookEvent): Promise<void>
  async sendMessage(recipientId: string, text: string): Promise<void>
  async refreshToken(): Promise<string>
}
```
```

### 5.2 Telegram Business API

```markdown
Реализуй поддержку Telegram Business API для ответов от лица мастера.

Отличия от обычного бота:
- Мастер подключает бота к своему аккаунту
- Бот отвечает от имени личного аккаунта мастера
- Диалоги видны в обычном Telegram мастера

События:
- `business_connection` — подключение/отключение
- `business_message` — сообщение в бизнес-чате

Настройка:
1. Мастер заходит в Telegram → Settings → Business → Chatbots
2. Выбирает нашего бота
3. Даёт разрешения (manage chats)
4. Мы получаем business_connection_id

Пример обработки:
```typescript
if (update.business_connection) {
  const { id, user, is_enabled } = update.business_connection
  if (is_enabled) {
    await saveBusinessConnection(user.id, id)
  } else {
    await removeBusinessConnection(user.id)
  }
}

if (update.business_message) {
  const vendorId = await getVendorByBusinessConnection(
    update.business_message.business_connection_id
  )
  // Process as usual...
}
```
```

---

## 6. UTILITY PROMPTS

### 6.1 Тестирование

```markdown
Напиши тесты для [КОМПОНЕНТ/ФУНКЦИЯ].

Стек:
- Vitest для unit/integration тестов
- Testing Library для компонентов
- MSW для мока API

Покрытие:
- Happy path
- Edge cases (пустые данные, ошибки)
- Валидация
- Async операции

Структура:
```typescript
describe('ComponentName', () => {
  it('should render correctly with data', () => {...})
  it('should show loading state', () => {...})
  it('should handle error', () => {...})
  it('should submit form successfully', () => {...})
})
```
```

### 6.2 Миграции

```markdown
Создай Supabase миграцию для [ИЗМЕНЕНИЕ].

Формат:
- Файл: supabase/migrations/[timestamp]_[description].sql
- Включи откат (DOWN) если возможно

Чеклист:
- [ ] Индексы для новых колонок
- [ ] RLS политики обновлены
- [ ] Не ломает существующие данные
- [ ] Тестировано локально

Пример:
```sql
-- Up
ALTER TABLE services ADD COLUMN is_popular BOOLEAN DEFAULT false;
CREATE INDEX idx_services_popular ON services(vendor_id, is_popular) WHERE is_popular = true;

-- Down
DROP INDEX IF EXISTS idx_services_popular;
ALTER TABLE services DROP COLUMN IF EXISTS is_popular;
```
```

---

## 7. DEBUGGING PROMPTS

### 7.1 Диагностика ошибки

```markdown
Помоги разобраться с ошибкой:

**Контекст:**
- Компонент/функция: [ИМЯ]
- Ожидаемое поведение: [ЧТО ДОЛЖНО БЫТЬ]
- Актуальное поведение: [ЧТО ПРОИСХОДИТ]

**Ошибка:**
```
[ВСТАВЬ ТЕКСТ ОШИБКИ]
```

**Код:**
```typescript
[ВСТАВЬ РЕЛЕВАНТНЫЙ КОД]
```

Проанализируй:
1. Причина ошибки
2. Возможные решения
3. Как предотвратить в будущем
```

### 7.2 Оптимизация

```markdown
Оптимизируй этот код:

```typescript
[КОД]
```

Цели:
- Производительность (N+1, лишние рендеры)
- Читаемость
- Type safety
- Bundle size (для фронта)

Ограничения:
- Сохранить API
- Совместимость с существующим кодом
```
