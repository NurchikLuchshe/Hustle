# 🔐 Google OAuth Setup Instructions

Для включения "Войти через Google" нужно настроить OAuth в Supabase Dashboard.

## Шаг 1: Создать Google OAuth Credentials

1. Открой [Google Cloud Console](https://console.cloud.google.com/)
2. Создай новый проект или выбери существующий
3. Включи **Google+ API**
4. Перейди в **APIs & Services** → **Credentials**
5. Нажми **Create Credentials** → **OAuth client ID**
6. Выбери **Web application**
7. Настрой:
   - **Name:** AI-Booking
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://jcczperyfdjwvcjiqrvj.supabase.co`
   - **Authorized redirect URIs:**
     - `https://jcczperyfdjwvcjiqrvj.supabase.co/auth/v1/callback`
8. Нажми **Create**
9. **Скопируй:**
   - Client ID
   - Client Secret

---

## Шаг 2: Настроить в Supabase Dashboard

1. Открой [Supabase Dashboard](https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj)
2. Переход: **Authentication** → **Providers**
3. Найди **Google** в списке
4. Включи переключатель **Enable**
5. Вставь:
   - Google Client ID
   - Google Client Secret
6. Нажми **Save**

---

## Шаг 3: Настроить URL Configuration

1. В Supabase: **Authentication** → **URL Configuration**
2. Установи:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** добавь `http://localhost:3000/**`

---

## Шаг 4: Проверка

1. Открой http://localhost:3000/login
2. Нажми **"Войти через Google"**
3. Должно открыть Google OAuth окно
4. После авторизации → редирект в `/dashboard`

✅ **Готово!** Google OAuth работает!

---

## Production Setup

Для production добавь:
- **JavaScript origins:** `https://yourdomain.com`
- **Redirect URIs:** `https://ваш-домен.supabase.co/auth/v1/callback`
- **Site URL:** `https://yourdomain.com`
