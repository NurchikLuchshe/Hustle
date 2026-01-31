# Telegram Bot Setup Guide

## 1. Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Введите название бота (например: "Hustle Booking Bot")
4. Введите username бота (например: `hustle_booking_bot`)
5. Скопируйте токен (формат: `123456789:ABC...`)

## 2. Настройка переменных окружения

Добавьте в `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

На Railway/Vercel добавьте эту переменную в настройках проекта.

## 3. Регистрация Webhook

После деплоя выполните команду (замените значения):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram-webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### Для локальной разработки (ngrok)

1. Установите [ngrok](https://ngrok.com/)
2. Запустите туннель:
   ```bash
   ngrok http 3000
   ```
3. Зарегистрируйте webhook с ngrok URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d '{"url": "https://abc123.ngrok.io/api/telegram-webhook"}'
   ```

## 4. Проверка работы

### Проверить статус webhook:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

### Удалить webhook:
```bash
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

## 5. Использование бота

### Команды для клиентов:

| Команда | Описание |
|---------|----------|
| `/start {slug}` | Начать запись к мастеру |
| `/book {slug}` | Альтернатива для записи |
| `/ai` | Чат с AI-ассистентом (в разработке) |
| `/cancel` | Отменить текущую запись |
| `/help` | Справка |

### Пример использования:

1. Клиент открывает бота
2. Отправляет `/start maria_beauty` (slug мастера)
3. Выбирает услугу из списка
4. Выбирает дату
5. Выбирает время
6. Вводит имя
7. Отправляет номер телефона (кнопка)
8. Получает подтверждение записи

### Ссылка для клиентов:

Мастер может давать клиентам ссылку вида:
```
https://t.me/your_bot_name?start=slug_mastera
```

## 6. Архитектура

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Telegram API   │────▶│  /api/telegram-  │────▶│  Supabase   │
│  (webhook POST) │     │  webhook         │     │  Database   │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Sessions   │
                        │  (in-memory) │
                        └──────────────┘
```

### Файлы:

| Файл | Описание |
|------|----------|
| `src/app/api/telegram-webhook/route.ts` | Основной webhook handler |
| `src/lib/telegram/api.ts` | Telegram API helpers |
| `src/lib/telegram/sessions.ts` | Session management |

## 7. Flow записи

```
/start {slug}
    │
    ▼
[Показать услуги] ◀──────┐
    │                    │
    ▼                    │
[Выбрать услугу]         │
    │                    │
    ▼                    │
[Показать даты]          │
    │               [Назад]
    ▼                    │
[Выбрать дату]           │
    │                    │
    ▼                    │
[Показать слоты]    ─────┘
    │
    ▼
[Выбрать время]
    │
    ▼
[Ввести имя]
    │
    ▼
[Отправить контакт]
    │
    ▼
[Создать запись в БД]
    │
    ▼
[Подтверждение]
```

## 8. Troubleshooting

### Бот не отвечает:
1. Проверьте `getWebhookInfo` - есть ли ошибки
2. Проверьте логи приложения
3. Убедитесь что `TELEGRAM_BOT_TOKEN` установлен

### "Услуг нет":
- Мастер должен добавить услуги в dashboard
- Услуги должны быть `is_active: true`

### "Нет слотов":
- Проверьте график работы мастера в настройках
- Возможно все слоты заняты
- Слоты доступны минимум за 2 часа

### Ошибки при создании записи:
- Проверьте `SUPABASE_SERVICE_ROLE_KEY`
- Проверьте RLS policies в Supabase
