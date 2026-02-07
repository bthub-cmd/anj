// ============================================
// UTILS: CUACA / WEATHER
// ============================================

const axios = require('axios');

const commands = {
    cuaca: {
        name: 'cuaca',
        aliases: ['weather', 'wt'],
        description: 'Info cuaca kota',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .cuaca <kota>' });
            }

            const kota = args.join(' ');
            await sock.sendMessage(from, { text: `🌤️ Mencari cuaca ${kota}...` });

            try {
                // Using OpenWeatherMap API (butuh API key)
                // Ini menggunakan API alternatif gratis
                const apiUrl = `https://api.akuari.my.id/info/cuaca?kota=${encodeURIComponent(kota)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    const w = res.data.respon;
                    const text = `🌤️ *CUACA ${kota.toUpperCase()}*

🌡️ Suhu: ${w.suhu || 'N/A'}
🌡️ Feels like: ${w.feels_like || 'N/A'}
💧 Kelembaban: ${w.kelembaban || 'N/A'}
🌬️ Angin: ${w.angin || 'N/A'}
☁️ Cuaca: ${w.cuaca || 'N/A'}
🌅 Sunrise: ${w.sunrise || 'N/A'}
🌇 Sunset: ${w.sunset || 'N/A'}`;

                    await sock.sendMessage(from, { text });
                } else {
                    throw new Error('No data');
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Kota tidak ditemukan.' });
            }
        }
    },

    infogempa: {
        name: 'infogempa',
        aliases: ['gempa', 'earthquake'],
        description: 'Info gempa terbaru (BMKG)',
        execute: async ({ sock, from }) => {
            try {
                const apiUrl = 'https://api.akuari.my.id/info/gempa';
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    const g = res.data.respon;
                    const text = `🌍 *INFO GEMPA TERBARU*

📅 Waktu: ${g.waktu || 'N/A'}
🌏 Lokasi: ${g.lokasi || 'N/A'}
📍 Koordinat: ${g.koordinat || 'N/A'}
📈 Magnitudo: ${g.magnitude || 'N/A'}
🔰 Kedalaman: ${g.kedalaman || 'N/A'}
⚠️ Potensi: ${g.potensi || 'N/A'}`;

                    await sock.sendMessage(from, { text });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengambil data gempa.' });
            }
        }
    }
};

module.exports = { commands };