const readline = require('readline');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
    process.exit(1);
}

if (!TELEGRAM_WEBHOOK_SECRET) {
    console.error('❌ TELEGRAM_WEBHOOK_SECRET не найден в .env.local');
    console.log('\n💡 Добавьте в .env.local:');
    console.log('TELEGRAM_WEBHOOK_SECRET=любая_случайная_строка_минимум_20_символов');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupWebhook() {
    console.log('🔧 Настройка Telegram Webhook\n');

    console.log('Выберите режим:');
    console.log('1. Локальная разработка (ngrok)');
    console.log('2. Production (Vercel/Railway)');
    console.log('3. Удалить webhook\n');

    const choice = await question('Введите номер (1-3): ');

    let webhookUrl = '';

    if (choice === '1') {
        console.log('\n📱 Локальная разработка');
        console.log('1. Установите ngrok: https://ngrok.com/download');
        console.log('2. Запустите: ngrok http 3000');
        console.log('3. Скопируйте HTTPS URL (например: https://abc123.ngrok.io)\n');

        const ngrokUrl = await question('Введите ngrok URL: ');
        webhookUrl = `${ngrokUrl.replace(/\/$/, '')}/api/telegram-webhook`;
    } else if (choice === '2') {
        const productionUrl = await question('Введите production URL (например: https://your-app.vercel.app): ');
        webhookUrl = `${productionUrl.replace(/\/$/, '')}/api/telegram-webhook`;
    } else if (choice === '3') {
        console.log('\n🗑️  Удаление webhook...');
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
        );
        const data = await response.json();

        if (data.ok) {
            console.log('✅ Webhook удален');
        } else {
            console.error('❌ Ошибка:', data.description);
        }
        rl.close();
        return;
    } else {
        console.log('❌ Неверный выбор');
        rl.close();
        process.exit(1);
    }

    console.log(`\n📡 Установка webhook: ${webhookUrl}`);

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: webhookUrl,
                    secret_token: TELEGRAM_WEBHOOK_SECRET,
                    allowed_updates: ['message', 'callback_query'],
                }),
            }
        );

        const data = await response.json();

        if (data.ok) {
            console.log('\n✅ Webhook успешно установлен!');
            console.log(`   URL: ${webhookUrl}`);
            console.log(`   Secret: ${TELEGRAM_WEBHOOK_SECRET.substring(0, 10)}...`);

            console.log('\n🎉 Готово! Теперь:');
            console.log('   1. Убедитесь что приложение запущено (npm run dev)');
            console.log('   2. Откройте бота в Telegram');
            console.log('   3. Отправьте /start');
        } else {
            console.error('\n❌ Ошибка установки webhook:', data.description);
        }
    } catch (error) {
        console.error('\n❌ Ошибка:', error.message);
    }

    rl.close();
}

setupWebhook();
