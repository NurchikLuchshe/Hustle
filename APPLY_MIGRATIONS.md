# 🔥 Применение миграций к Supabase

Теперь нужно применить схему базы данных к вашему Supabase проекту.

## Вариант 1: Через Supabase Dashboard (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Открой SQL Editor
👉 https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj/sql/new

### Шаг 2: Скопируй миграцию
Открой файл `supabase/migrations/20260116_initial_schema.sql` и **скопируй весь его содержимое**.

### Шаг 3: Вставь и выполни
1. Вставь скопированный SQL в редактор
2. Нажми **Run** (или Ctrl+Enter)
3. Дождись выполнения (~5-10 секунд)
4. Убедись что нет ошибок (должно быть "Success")

### Шаг 4: Проверка
Перейди: https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj/editor

Должны появиться таблицы:
- ✅ vendors
- ✅ services
- ✅ work_schedules
- ✅ schedule_exceptions
- ✅ clients
- ✅ bookings
- ✅ conversations
- ✅ messages
- ✅ embeddings
- ✅ verification_codes
- ✅ qr_links

---

## Вариант 2: Автоматически (Требует Supabase CLI)

```bash
# Установи Supabase CLI
npm install -g supabase

# Залогинься
npx supabase login

# Свяжись с проектом
npx supabase link --project-ref jcczperyfdjwvcjiqrvj

# Примени миграции
npx supabase db push
```

---

## После применения миграций

Переименуй файл:
```bash
ren env.local.ready .env.local
```

Или создай `.env.local` вручную и скопируй содержимое из `env.local.ready`

Затем запусти:
```bash
npm run dev
```

Проверь подключение:
```bash
curl http://localhost:3000/api/test
```

Должно вернуть: `{"status":"success"}`

🎉 **Готово!**
