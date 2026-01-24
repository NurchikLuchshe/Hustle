# Firebase Setup Guide

## 🔥 Что такое Firebase?

Firebase - это платформа от Google для:
- **Analytics** 📊 - отслеживание поведения пользователей
- **Cloud Messaging (FCM)** 🔔 - push-уведомления
- **Cloud Storage** 💾 - хранение файлов
- **Authentication** 🔐 - альтернатива Supabase Auth

## 📋 Получение ключей Firebase

### 1. Создать проект

1. Перейти на https://console.firebase.google.com/
2. Нажать **"Add project"** (или "Добавить проект")
3. Ввести название: `AI-Booking` (или любое)
4. **Отключить** Google Analytics (или включить, если нужна аналитика)
5. Создать проект

### 2. Добавить Web App

1. В консоли Firebase → Project Overview
2. Нажать иконку **Web** (`</>`)
3. Ввести App nickname: `AI-Booking Web`
4. **НЕ** ставить галочку "Firebase Hosting" (пока)
5. Нажать **"Register app"**

### 3. Скопировать конфигурацию

Firebase покажет код типа:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCbkfePnvoxliWYUq1Cvd3CmTD29VWnEY0",
  authDomain: "hustle-42fe2.firebaseapp.com",
  projectId: "hustle-42fe2",
  storageBucket: "hustle-42fe2.firebasestorage.app",
  messagingSenderId: "363273744287",
  appId: "1:363273744287:web:5a04ccd4320b7ccec2d7aa",
  measurementId: "G-JKCF1T94NK"
};
```

### 4. Добавить в `.env.local`

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCbkfePnvoxliWYUq1Cvd3CmTD29VWnEY0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hustle-42fe2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hustle-42fe2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hustle-42fe2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=363273744287
NEXT_PUBLIC_FIREBASE_APP_ID=1:363273744287:web:5a04ccd4320b7ccec2d7aa
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-JKCF1T94NK
```

---

## 🚀 Использование

Firebase уже настроен в проекте! Файл `src/lib/firebase.ts` готов.

### Analytics - отслеживание событий

```typescript
"use client";

import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function BookingPage() {
  const handleBooking = () => {
    // Отслеживать событие создания записи
    if (analytics) {
      logEvent(analytics, "booking_created", {
        service: "haircut",
        price: 1500,
        vendor_id: "123",
      });
    }
  };

  return <button onClick={handleBooking}>Записаться</button>;
}
```

### Полезные события для AI-Booking

```typescript
// Регистрация мастера
logEvent(analytics, "vendor_signup", {
  business_type: "beauty_salon",
  plan: "start",
});

// Просмотр публичной страницы записи
logEvent(analytics, "page_view", {
  page_title: "Booking Page",
  vendor_slug: "maria_beauty",
});

// Создание записи клиентом
logEvent(analytics, "booking_created", {
  source: "web" | "telegram" | "instagram",
  service_id: "123",
  price: 1500,
});

// Отмена записи
logEvent(analytics, "booking_cancelled", {
  reason: "client_request",
});
```

---

## 📊 Просмотр аналитики

1. Firebase Console → Analytics → Dashboard
2. Там будут графики:
   - Активные пользователи
   - События
   - Конверсия
   - Retention (удержание)

---

## 🔔 Push-уведомления (FCM)

### Настройка

1. Firebase Console → Project Settings → Cloud Messaging
2. Скопировать **Server Key** и **Sender ID**
3. Добавить в `.env.local`:
```env
FIREBASE_SERVER_KEY=ваш-server-key
```

### Использование

```typescript
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";

const messaging = getMessaging(app);

// Получить токен устройства
const token = await getToken(messaging, {
  vapidKey: "ваш-vapid-key",
});

// Отправить на сервер для подписки
await fetch("/api/subscribe-push", {
  method: "POST",
  body: JSON.stringify({ token }),
});
```

---

## 🛡️ Безопасность

### Правила для Storage (если используете)

Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Прайс-листы могут загружать только авторизованные
    match /price-lists/{vendorId}/{filename} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 💡 Когда использовать Firebase?

### ✅ Используйте для:
- **Analytics** - бесплатная аналитика
- **FCM** - push-уведомления в браузере
- **Storage** - если нужно хранить изображения (альтернатива Supabase Storage)

### ❌ НЕ используйте для:
- **Authentication** - у вас есть Supabase Auth
- **Database** - у вас есть PostgreSQL через Supabase
- **Serverless Functions** - используйте Next.js API routes

---

## 🔗 Полезные ссылки

- [Firebase Console](https://console.firebase.google.com/)
- [Analytics Events Reference](https://firebase.google.com/docs/analytics/events)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)

---

## 📦 Установленные пакеты

```bash
npm install firebase  # уже установлено
```

Готово! Firebase интегрирован в проект. 🎉
