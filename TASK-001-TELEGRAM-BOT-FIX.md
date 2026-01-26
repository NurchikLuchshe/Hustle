# TASK-001: Восстановление Telegram Bot Webhook

**Приоритет:** CRITICAL
**Исполнитель:** Antigravity AI
**Ревизор:** Lead Dev

---

## КОНТЕКСТ ПРОБЛЕМЫ

Telegram бот не работает. Причина установлена: в коммите `e214047` были удалены ключевые файлы webhook endpoint.

### Удалённые файлы:
- `src/app/api/telegram-webhook/route.ts` (Next.js API route)
- `supabase/functions/telegram-webhook/index.ts` (Supabase Edge Function)
- `TELEGRAM_BOT_SETUP.md` (инструкции)

### Что осталось рабочим:
- `supabase/functions/_shared/telegram.ts` — helper функции для Telegram API
- Типы в `src/shared/types/api.types.ts` и `database.types.ts`
- Конфигурация в `.env.example`

---

## ЗАДАЧА

Восстановить работоспособность Telegram бота путём создания нового webhook endpoint.

---

## ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ

### 1. Создать файл `src/app/api/telegram-webhook/route.ts`

**Архитектура:**
```
POST /api/telegram-webhook
├── Валидация входящего запроса
├── Парсинг TelegramUpdate
├── Роутинг по типу update:
│   ├── message.text → handleTextMessage()
│   ├── message.contact → handleContact()
│   └── callback_query → handleCallbackQuery()
└── Response 200 OK (всегда, чтобы Telegram не ретраил)
```

### 2. Реализовать команды бота

| Команда | Действие |
|---------|----------|
| `/start` | Проверить регистрацию vendor по `telegram_id`. Если есть — показать ссылку на профиль. Если нет — предложить `/register` |
| `/register` | Начать flow регистрации нового мастера |
| `/menu` | Показать inline-клавиатуру с действиями |
| `/help` | Справка по командам |

### 3. Flow регистрации мастера (3 шага)

```
Шаг 1: "Введите название вашего бизнеса"
        → Сохранить в conversation state

Шаг 2: "Придумайте URL для записи (латиницей)"
        → Проверить уникальность slug в таблице vendors
        → Если занят — попросить другой

Шаг 3: "Отправьте ваш номер телефона"
        → Кнопка "Поделиться контактом"
        → Создать vendor в БД
        → Создать auth user (опционально)
        → Отправить ссылку на dashboard
```

### 4. Хранение состояния диалога

Использовать таблицу `conversations` или создать новую `telegram_sessions`:

```sql
-- Если нужно создать
CREATE TABLE telegram_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  state TEXT NOT NULL DEFAULT 'idle',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Возможные состояния: `idle`, `awaiting_business_name`, `awaiting_slug`, `awaiting_phone`

### 5. Переменные окружения (обязательные)

```env
TELEGRAM_BOT_TOKEN=xxx           # Токен бота от @BotFather
TELEGRAM_WEBHOOK_SECRET=xxx      # Секрет для валидации (опционально)
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx    # Для создания записей в БД
NEXT_PUBLIC_APP_URL=xxx          # Для формирования ссылок
```

---

## РЕФЕРЕНСНЫЙ КОД

### Последняя рабочая версия webhook (упрощённая):
```bash
git show d4a970c:src/app/api/telegram-webhook/route.ts
```

### Полная версия с регистрацией (Supabase Function):
```bash
git show 77d50d6:supabase/functions/telegram-webhook/index.ts
```

### Helper функции (актуальный файл):
```
supabase/functions/_shared/telegram.ts
```

Содержит готовые функции:
- `sendMessage(chatId, text)`
- `sendMessageWithKeyboard(chatId, text, keyboard)`
- `requestContact(chatId, text)`
- `answerCallbackQuery(queryId)`
- `editMessageText(chatId, messageId, text)`

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Файл `src/app/api/telegram-webhook/route.ts` создан и работает
- [ ] Команда `/start` отвечает корректно
- [ ] Команда `/register` запускает flow регистрации
- [ ] После регистрации создаётся запись в таблице `vendors`
- [ ] Состояние диалога сохраняется между сообщениями
- [ ] Бот корректно обрабатывает ошибки (не падает, логирует)
- [ ] Код не содержит хардкода токенов

---

## ПОРЯДОК ВЫПОЛНЕНИЯ

1. Изучить референсный код из git истории
2. Изучить helper функции в `_shared/telegram.ts`
3. Создать webhook route с базовой обработкой `/start`
4. Добавить хранение состояния диалога
5. Реализовать полный flow регистрации
6. Протестировать локально через ngrok или deploy
7. Написать инструкцию по настройке webhook в Telegram

---

## ОГРАНИЧЕНИЯ

- НЕ использовать Supabase Edge Functions (деплоим на Railway)
- НЕ менять существующую структуру таблиц без согласования
- НЕ удалять и не модифицировать `_shared/telegram.ts`

---

## ПОСЛЕ ВЫПОЛНЕНИЯ

Создать файл `TELEGRAM_SETUP.md` с инструкцией:
1. Как получить токен бота
2. Как зарегистрировать webhook
3. Как проверить что бот работает

---

**Вопросы — к Lead Dev через комментарий в этом файле.**
