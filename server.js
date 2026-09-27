const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

// Bulut sunucuya tam uyumlu WhatsApp İstemcisi
const client = new Client({
    authStrategy: new LocalAuth(), // Oturumu kaydeder
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Bulut sunucular için zorunlu ayar
    }
});

// Render Logs ekranına QR Kod Bas
client.on('qr', (qr) => {
    console.log('\n--- BARKOD OLUŞTURULDU ---');
    console.log('Lütfen telefonunuzdan WhatsApp Web\'i açıp şu QR kodu okutun:');
    qrcode.generate(qr, { small: true });
});

// Bağlantı Kurulduğunda
client.on('ready', () => {
    console.log('\n✅ BAĞLANTI BAŞARILI! WhatsApp motoru bulutta 7/24 çalışıyor.');
});

client.initialize();

// Vercel'den gelecek mesaj isteklerini karşılayan uç nokta
app.post('/api/whatsapp', async (req, res) => {
    const { phone, message } = req.body;
    
    try {
        // Numarayı WhatsApp formatına çevir (örn: 90532xxxxxxx@c.us)
        const formattedPhone = phone.replace(/\D/g, ''); 
        const chatId = `${formattedPhone}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`[BAŞARILI] Mesaj gönderildi -> ${formattedPhone}`);
        
        res.status(200).json({ success: true, message: 'Mesaj iletildi' });
    } catch (error) {
        console.error('[HATA] Mesaj gönderilemedi:', error);
        res.status(500).json({ success: false, error: error.toString() });
    }
});

// Render'ın atadığı portu veya lokalde 3001'i kullan
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} üzerinde dinleniyor...`);
    console.log('WhatsApp başlatılıyor, QR kod birazdan ekrana gelecek...');
});