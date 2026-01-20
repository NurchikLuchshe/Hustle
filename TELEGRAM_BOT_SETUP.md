# Telegram Bot Setup Guide

## 🤖 Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите название бота (например: `AI Booking Assistant`)
4. Введите username (должен заканчиваться на `bot`, например: `aibooking_bot`)
5. Скопируйте **токен** (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## ⚙️ Настройка переменных окружения

Добавьте в `.env.local`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
TELEGRAM_WEBHOOK_SECRET=любая_случайная_строка_минимум_20_символов
```

Генерация секрета (в терминале):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Установка Webhook

### Локальная разработка (через ngrok)

1. Установите ngrok: https://ngrok.com/download

2. Запустите туннель:
```bash
ngrok http 3000
```

3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

4. Установите webhook:
```bash
export TELEGRAM_BOT_TOKEN="ваш_токен"
export WEBHOOK_SECRET="ваш_секрет"

curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://abc123.ngrok.io/api/telegram-webhook\",
    \"secret_token\": \"${WEBHOOK_SECRET}\"
  }"
```

### Production (Vercel)

После деплоя на Vercel:

```bash
export TELEGRAM_BOT_TOKEN="ваш_токен"
export WEBHOOK_SECRET="ваш_секрет"

curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://your-app.vercel.app/api/telegram-webhook\",
    \"secret_token\": \"${WEBHOOK_SECRET}\"
  }"
```

## ✅ Проверка webhook

```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

Должно вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 📱 Использование бота

### Команды

- `/start` - Приветствие и начало работы
- `/register` - Регистрация нового бизнеса
- `/menu` - Меню управления

### Flow регистрации

1. Пользователь отправляет `/register`
2. Бот спрашивает название бизнеса
3. Бот предлагает URL (slug)
4. Бот просит номер телефона
5. Создается профиль vendor в БД
6. Пользователь получает ссылку для записи

### Для клиентов (будущее)

Клиенты смогут:
- Написать боту "Запиши меня на стрижку"
- AI найдет мастера, предложит время
- Создаст запись автоматически

## 🐛 Troubleshooting

### Webhook не устанавливается

Проверьте:
- URL должен быть HTTPS
- Сертификат должен быть валидным
- Порт должен быть 443, 80, 88 или 8443

### Бот не отвечает

1. Проверить webhook:
```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

2. Проверить логи в Vercel/Railway

3. Удалить и пересоздать webhook:
```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook"
# Затем снова setWebhook
```

### База данных

Убедитесь что таблица `conversations` создана:
```sql
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id TEXT,
    context JSONB,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Безопасность

- ✅ Webhook защищен секретным токеном
- ✅ Используется HTTPS
- ✅ Telegram ID сохраняется в БД
- ✅ RLS политики применяются

## 📚 Документация Telegram Bot API

https://core.telegram.org/bots/api
