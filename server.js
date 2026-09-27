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

client.on('qr', (qr) => {
    console.log('\n--- BARKOD OLUŞTURULDU ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n✅ BAĞLANTI BAŞARILI!');
});

client.initialize();

// Ortak mesaj gönderme fonksiyonu (Her iki adres için de çalışır)
const handleSendMessage = async (req, res) => {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Telefon ve mesaj alanları zorunludur.' });
    }

    try {
        const formattedPhone = phone.replace(/\D/g, ''); 
        const chatId = `${formattedPhone}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`[BAŞARILI] Mesaj gönderildi -> ${formattedPhone}`);
        
        return res.status(200).json({ success: true, message: 'Mesaj iletildi' });
    } catch (error) {
        console.error('[HATA] Mesaj gönderilemedi:', error);
        return res.status(500).json({ success: false, error: error.toString() });
    }
};

// v0 hangi adrese istek atarsa atsın buraya düşecek:
app.post('/api/whatsapp', handleSendMessage);
app.post('/send-message', handleSendMessage);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} üzerinde dinleniyor...`);
});