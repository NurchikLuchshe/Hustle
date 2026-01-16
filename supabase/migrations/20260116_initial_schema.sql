-- ============================================================
-- AI-BOOKING: Database Schema
-- PostgreSQL + Supabase + pgvector
-- ============================================================

-- Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- 1. VENDORS (Мастера/Салоны) - Корень Multi-tenant
-- ============================================================
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Основные данные
    slug TEXT UNIQUE NOT NULL, -- book.me/slug
    business_name TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,

    -- Локализация
    timezone TEXT DEFAULT 'Europe/Moscow',
    currency TEXT DEFAULT 'RUB',
    locale TEXT DEFAULT 'ru',

    -- Настройки бронирования
    booking_settings JSONB DEFAULT '{
        "min_advance_hours": 2,
        "max_advance_days": 30,
        "buffer_minutes": 15,
        "require_phone_verification": true,
        "auto_confirm": true
    }'::jsonb,

    -- Интеграции
    telegram_config JSONB DEFAULT '{}'::jsonb,
    -- {
    --   "bot_token": "...",
    --   "business_connection_id": "...",
    --   "webhook_secret": "..."
    -- }

    instagram_config JSONB DEFAULT '{}'::jsonb,
    -- {
    --   "page_id": "...",
    --   "access_token": "...",
    --   "token_expires_at": "..."
    -- }

    -- AI настройки
    ai_config JSONB DEFAULT '{
        "personality": "friendly",
        "language": "ru",
        "custom_instructions": ""
    }'::jsonb,

    -- Тариф
    plan TEXT DEFAULT 'start' CHECK (plan IN ('start', 'pro', 'business')),
    plan_expires_at TIMESTAMPTZ,
    ai_tokens_used INTEGER DEFAULT 0,
    ai_tokens_limit INTEGER DEFAULT 0,

    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Индексы
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_user_id ON vendors(user_id);

-- ============================================================
-- 2. SERVICES (Услуги)
-- ============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    -- Основные данные
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'haircut', 'massage', 'nails', etc.

    -- Ценообразование
    price DECIMAL(10, 2) NOT NULL,
    price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'from', 'range')),
    price_max DECIMAL(10, 2), -- Для типа 'range'

    -- Длительность
    duration_minutes INTEGER NOT NULL,
    buffer_after_minutes INTEGER DEFAULT 0, -- Время на уборку/подготовку

    -- Доступность
    is_active BOOLEAN DEFAULT true,
    is_online_bookable BOOLEAN DEFAULT true, -- Можно ли записаться онлайн

    -- AI/RAG
    embedding VECTOR(1536), -- Векторное представление для поиска

    -- Порядок отображения
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_embedding ON services USING ivfflat (embedding vector_cosine_ops);

-- ============================================================
-- 3. WORK_SCHEDULES (Рабочий график)
-- ============================================================
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    -- День недели (0 = Понедельник, 6 = Воскресенье)
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),

    -- Рабочие часы
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Перерывы
    breaks JSONB DEFAULT '[]'::jsonb,
    -- [{"start": "12:00", "end": "13:00", "name": "Обед"}]

    is_working_day BOOLEAN DEFAULT true,

    UNIQUE(vendor_id, day_of_week)
);

CREATE INDEX idx_work_schedules_vendor ON work_schedules(vendor_id);

-- ============================================================
-- 4. SCHEDULE_EXCEPTIONS (Исключения: выходные, праздники)
-- ============================================================
CREATE TABLE schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    exception_date DATE NOT NULL,
    exception_type TEXT CHECK (exception_type IN ('day_off', 'custom_hours')),

    -- Для custom_hours
    start_time TIME,
    end_time TIME,

    reason TEXT,

    UNIQUE(vendor_id, exception_date)
);

CREATE INDEX idx_schedule_exceptions_vendor_date ON schedule_exceptions(vendor_id, exception_date);

-- ============================================================
-- 5. CLIENTS (Клиенты)
-- ============================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    -- Идентификация
    phone TEXT,
    telegram_id BIGINT,
    instagram_id TEXT,

    -- Профиль
    name TEXT,
    email TEXT,
    notes TEXT, -- Заметки мастера о клиенте

    -- Предпочтения
    preferences JSONB DEFAULT '{}'::jsonb,
    -- {"preferred_time": "evening", "allergies": ["latex"]}

    -- Статистика
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_visit_at TIMESTAMPTZ,

    -- Маркетинг
    marketing_consent BOOLEAN DEFAULT false,
    referral_code TEXT,
    referred_by UUID REFERENCES clients(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Уникальность клиента в рамках вендора
    UNIQUE(vendor_id, phone),
    UNIQUE(vendor_id, telegram_id)
);

CREATE INDEX idx_clients_vendor ON clients(vendor_id);
CREATE INDEX idx_clients_phone ON clients(vendor_id, phone);
CREATE INDEX idx_clients_telegram ON clients(vendor_id, telegram_id);

-- ============================================================
-- 6. BOOKINGS (Бронирования)
-- ============================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,

    -- Время
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Статус
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Ожидает подтверждения
        'confirmed',    -- Подтверждено
        'cancelled',    -- Отменено
        'completed',    -- Завершено
        'no_show'       -- Клиент не пришёл
    )),

    -- Источник
    source TEXT CHECK (source IN ('web', 'telegram', 'instagram', 'manual', 'phone')),

    -- Цена на момент бронирования
    price DECIMAL(10, 2),

    -- Напоминания
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent BOOLEAN DEFAULT false,

    -- Метаданные
    notes TEXT, -- Комментарий клиента
    internal_notes TEXT, -- Внутренние заметки мастера
    cancellation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_time ON bookings(vendor_id, start_time, end_time);
CREATE INDEX idx_bookings_status ON bookings(vendor_id, status);

-- ============================================================
-- 7. CONVERSATIONS (История диалогов для AI)
-- ============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

    -- Платформа
    platform TEXT CHECK (platform IN ('telegram', 'instagram', 'web')),
    platform_chat_id TEXT, -- ID чата в платформе

    -- Состояние диалога
    context JSONB DEFAULT '{}'::jsonb,
    -- {"current_intent": "booking", "selected_service": "uuid", "selected_date": "2024-01-15"}

    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX idx_conversations_platform ON conversations(vendor_id, platform, platform_chat_id);

-- ============================================================
-- 8. MESSAGES (Сообщения в диалогах)
-- ============================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,

    role TEXT CHECK (role IN ('user', 'assistant', 'system', 'function')),
    content TEXT NOT NULL,

    -- Для function calling
    function_name TEXT,
    function_args JSONB,
    function_result JSONB,

    -- Метаданные
    tokens_used INTEGER,
    model_used TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- 9. EMBEDDINGS (Векторные представления для RAG)
-- ============================================================
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    -- Источник
    source_type TEXT CHECK (source_type IN ('service', 'faq', 'policy', 'custom')),
    source_id UUID, -- ID связанной сущности

    -- Контент
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,

    -- Метаданные для фильтрации
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_vendor ON embeddings(vendor_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- ============================================================
-- 10. VERIFICATION_CODES (OTP коды)
-- ============================================================
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_codes_phone ON verification_codes(phone, is_used);

-- ============================================================
-- 11. QR_LINKS (Динамические QR-ссылки)
-- ============================================================
CREATE TABLE qr_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

    short_code TEXT UNIQUE NOT NULL, -- book.me/q/ABC123
    target_type TEXT CHECK (target_type IN ('telegram', 'web', 'auto')),

    -- Аналитика
    clicks INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_links_code ON qr_links(short_code);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Включаем RLS для всех таблиц
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;

-- Политики для vendors
CREATE POLICY "Users can view their own vendor" ON vendors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor" ON vendors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendor" ON vendors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для services
CREATE POLICY "Vendors can manage their services" ON services
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для work_schedules
CREATE POLICY "Vendors can manage their schedules" ON work_schedules
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для schedule_exceptions
CREATE POLICY "Vendors can manage their exceptions" ON schedule_exceptions
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для clients
CREATE POLICY "Vendors can manage their clients" ON clients
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для bookings
CREATE POLICY "Vendors can manage their bookings" ON bookings
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для conversations
CREATE POLICY "Vendors can view their conversations" ON conversations
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для messages
CREATE POLICY "Vendors can view messages in their conversations" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
        )
    );

-- Политики для embeddings
CREATE POLICY "Vendors can manage their embeddings" ON embeddings
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Политики для qr_links
CREATE POLICY "Vendors can manage their QR links" ON qr_links
    FOR ALL USING (
        vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Публичный доступ для клиентов к некоторым данным
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

-- ============================================================
-- FUNCTIONS (Вспомогательные функции)
-- ============================================================

-- Функция получения свободных слотов
CREATE OR REPLACE FUNCTION get_available_slots(
    p_vendor_id UUID,
    p_service_id UUID,
    p_date DATE
)
RETURNS TABLE (slot_time TIMESTAMPTZ) AS $$
DECLARE
    v_service RECORD;
    v_schedule RECORD;
    v_timezone TEXT;
    v_slot TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_booking_settings JSONB;
BEGIN
    -- Получаем данные услуги
    SELECT * INTO v_service FROM services WHERE id = p_service_id;

    -- Получаем таймзону и настройки вендора
    SELECT timezone, booking_settings INTO v_timezone, v_booking_settings
    FROM vendors WHERE id = p_vendor_id;

    -- Получаем расписание на этот день недели
    SELECT * INTO v_schedule
    FROM work_schedules
    WHERE vendor_id = p_vendor_id
    AND day_of_week = EXTRACT(DOW FROM p_date)::INTEGER;

    -- Если выходной
    IF NOT v_schedule.is_working_day THEN
        RETURN;
    END IF;

    -- Проверяем исключения
    IF EXISTS (
        SELECT 1 FROM schedule_exceptions
        WHERE vendor_id = p_vendor_id
        AND exception_date = p_date
        AND exception_type = 'day_off'
    ) THEN
        RETURN;
    END IF;

    -- Генерируем слоты
    v_slot := p_date + v_schedule.start_time;

    WHILE v_slot + (v_service.duration_minutes || ' minutes')::INTERVAL <= p_date + v_schedule.end_time LOOP
        v_slot_end := v_slot + (v_service.duration_minutes || ' minutes')::INTERVAL;

        -- Проверяем, нет ли пересечения с существующими бронированиями
        IF NOT EXISTS (
            SELECT 1 FROM bookings
            WHERE vendor_id = p_vendor_id
            AND status NOT IN ('cancelled')
            AND (start_time, end_time) OVERLAPS (v_slot, v_slot_end)
        ) THEN
            slot_time := v_slot;
            RETURN NEXT;
        END IF;

        -- Следующий слот (шаг 30 минут)
        v_slot := v_slot + INTERVAL '30 minutes';
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Функция поиска по эмбеддингам с фильтрацией по vendor
CREATE OR REPLACE FUNCTION match_embeddings(
    p_vendor_id UUID,
    p_query_embedding VECTOR(1536),
    p_match_count INTEGER DEFAULT 5,
    p_match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity FLOAT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.content,
        1 - (e.embedding <=> p_query_embedding) AS similarity,
        e.metadata
    FROM embeddings e
    WHERE e.vendor_id = p_vendor_id
    AND 1 - (e.embedding <=> p_query_embedding) > p_match_threshold
    ORDER BY e.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер к таблицам
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
