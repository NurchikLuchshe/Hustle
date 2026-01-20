const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
    process.exit(1);
}

async function testBot() {
    try {
        console.log('🤖 Проверка подключения к Telegram Bot API...\n');

        // Get bot info
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
        );
        const data = await response.json();

        if (data.ok) {
            console.log('✅ Бот найден!');
            console.log(`   Имя: ${data.result.first_name}`);
            console.log(`   Username: @${data.result.username}`);
            console.log(`   ID: ${data.result.id}\n`);

            // Check webhook status
            const webhookResponse = await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
            );
            const webhookData = await webhookResponse.json();

            if (webhookData.ok) {
                const info = webhookData.result;

                if (info.url) {
                    console.log('📡 Webhook статус:');
                    console.log(`   URL: ${info.url}`);
                    console.log(`   Последняя ошибка: ${info.last_error_message || 'нет'}`);
                    console.log(`   Pending updates: ${info.pending_update_count || 0}\n`);
                } else {
                    console.log('⚠️  Webhook не настроен');
                    console.log('   Запустите: npm run telegram:setup-webhook\n');
                }
            }

            console.log('🎉 Все готово! Бот работает.');
            console.log('\n📋 Следующие шаги:');
            console.log('   1. Если разработка локально: установите ngrok');
            console.log('   2. Запустите: npm run telegram:setup-webhook');
            console.log('   3. Откройте бота в Telegram и отправьте /start');

        } else {
            console.error('❌ Ошибка:', data.description);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Ошибка подключения:', error.message);
        process.exit(1);
    }
}

testBot();
