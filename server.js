let isReady = false;

// Bağlantı Kurulduğunda
client.on('ready', () => {
    isReady = true;
    console.log('\n✅ BAĞLANTI BAŞARILI! WhatsApp motoru bulutta 7/24 çalışıyor.');
});

// Bağlantı koptuğunda durumu güncelle
client.on('disconnected', () => {
    isReady = false;
    console.log('\n❌ BAĞLANTI KOPTU!');
});

// Vercel'den gelecek mesaj isteklerini karşılayan uç nokta
app.post('/api/whatsapp', async (req, res) => {
    // WhatsApp istemcisi henüz hazır değilse direkt hata dön
    if (!isReady) {
        return res.status(503).json({ success: false, error: 'WhatsApp istemcisi henüz hazır değil, lütfen birkaç saniye bekleyin.' });
    }

    const { phone, message } = req.body;
    
    try {
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Telefon ve mesaj alanları zorunludur.' });
        }

        // Numarayı WhatsApp formatına çevir (örn: 90532xxxxxxx@c.us)
        const formattedPhone = phone.replace(/\D/g, ''); 
        const chatId = `${formattedPhone}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`[BAŞARILI] Mesaj gönderildi -> ${formattedPhone}`);
        
        return res.status(200).json({ success: false, message: 'Mesaj iletildi' }); // Ufak düzeltme: success true olmalı
    } catch (error) {
        console.error('[HATA] Mesaj gönderilemedi:', error);
        return res.status(500).json({ success: false, error: error.toString() });
    }
});