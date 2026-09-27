const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

// WhatsApp İstemcisini Başlatıyoruz
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Kod Üretildiğinde Konsola Yazdır
client.on('qr', (qr) => {
    console.log('\n--- BARKOD OLUŞTURULDU ---');
    console.log('Lütfen telefonunuzdan WhatsApp Web\'i açıp şu QR kodu okutun:');
    qrcode.generate(qr, { small: true });
});

// Bağlantı Başarılı Olduğunda
client.on('ready', () => {
    console.log('\n✅ BAĞLANTI BAŞARILI! WhatsApp motoru bulutta 7/24 çalışıyor.');
});

// Bağlantı Koptuğunda Otomatik Yeniden Başlatma/Log
client.on('disconnected', (reason) => {
    console.log('\n❌ BAĞLANTI KOPTU:', reason);
});

// İstemciyi Aktif Et
client.initialize();

// Vercel / v0'dan Gelen İstekleri Doğrudan İşleyen Uç Nokta
app.post('/api/whatsapp', async (req, res) => {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Telefon ve mesaj alanları zorunludur.' });
    }

    try {
        // Numarayı WhatsApp formatına çevir (örn: 90532xxxxxxx@c.us)
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

// Render Port Ayarı
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} üzerinde dinleniyor...`);
});