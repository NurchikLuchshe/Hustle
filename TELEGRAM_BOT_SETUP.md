# Telegram Bot Setup

## Токен
```
8493293674:AAESeIS_tlMEfS2ZviJqOhOAProjj2JtLUM
```

## Настройка Webhook

1. Deploy функцию в Supabase:
```bash
supabase functions deploy telegram-webhook
```

2. Установить переменные окружения:
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=8493293674:AAESeIS_tlMEfS2ZviJqOhOAProjj2JtLUM
supabase secrets set APP_URL=http://localhost:3000
```

3. Зарегистрировать webhook:
```bash
curl -X POST "https://api.telegram.org/bot8493293674:AAESeIS_tlMEfS2ZviJqOhOAProjj2JtLUM/setWebhook" \
  -d "url=YOUR_SUPABASE_FUNCTION_URL/telegram-webhook"
```

## Команды бота

- `/start` - Приветствие
- `/register` - Регистрация нового бизнеса
- `/menu` - Меню управления

## Flow регистрации

1. `/register`
2. Бот спрашивает название бизнеса
3. Пользователь вводит название
4. Бот предлагает slug (URL)
5. Пользователь подтверждает или вводит свой
6. Бот спрашивает телефон
7. Создается vendor + auth user
8. Бот отправляет credentials для входа на сайт

## Что дальше

- [ ] AI для обработки сообщений (создание услуг)
- [ ] Управление расписанием через бота
- [ ] Просмотр записей
- [ ] Уведомления о новых записях
