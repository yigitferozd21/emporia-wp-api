const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

let isReady = false;

// 1. Önce client nesnesini tanımlıyoruz
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// 2. Sonra olayları (events) dinliyoruz
client.on('qr', (qr) => {
    console.log('\n--- BARKOD OLUŞTURULDU ---');
    console.log('Lütfen telefonunuzdan WhatsApp Web\'i açıp şu QR kodu okutun:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    isReady = true;
    console.log('\n✅ BAĞLANTI BAŞARILI! WhatsApp motoru bulutta 7/24 çalışıyor.');
});

client.on('disconnected', () => {
    isReady = false;
    console.log('\n❌ BAĞLANTI KOPTU!');
});

// 3. Client'ı başlatıyoruz
client.initialize();

// 4. API Endpoint
app.post('/api/whatsapp', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ success: false, error: 'WhatsApp istemcisi henüz hazır değil, lütfen birkaç saniye bekleyin.' });
    }

    const { phone, message } = req.body;
    
    try {
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Telefon ve mesaj alanları zorunludur.' });
        }

        const formattedPhone = phone.replace(/\D/g, ''); 
        const chatId = `${formattedPhone}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`[BAŞARILI] Mesaj gönderildi -> ${formattedPhone}`);
        
        return res.status(200).json({ success: true, message: 'Mesaj iletildi' });
    } catch (error) {
        console.error('[HATA] Mesaj gönderilemedi:', error);
        return res.status(500).json({ success: false, error: error.toString() });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} üzerinde dinleniyor...`);
});