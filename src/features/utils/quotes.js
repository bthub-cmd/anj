// ============================================
// UTILS: QUOTES & RANDOM TEXT
// ============================================

const axios = require('axios');

const quotes = [
    { text: "Jangan pernah menyerah pada mimpimu.", author: "Unknown" },
    { text: "Kesuksesan adalah perjalanan, bukan tujuan.", author: "Ben Sweetland" },
    { text: "Setiap hari adalah kesempatan baru.", author: "Unknown" },
    { text: "Kerja keras mengalahkan bakat.", author: "Tim Notke" }
];

const commands = {
    quotes: {
        name: 'quotes',
        aliases: ['quote', 'kata'],
        description: 'Random quotes motivasi',
        execute: async ({ sock, from }) => {
            try {
                const res = await axios.get('https://api.akuari.my.id/randomtext/quotes');
                if (res.data.result) {
                    const q = res.data.result;
                    await sock.sendMessage(from, { 
                        text: `💬 *${q.quotes}*\n\n- ${q.author}` 
                    });
                } else {
                    throw new Error('API error');
                }
            } catch (e) {
                // Fallback local
                const q = quotes[Math.floor(Math.random() * quotes.length)];
                await sock.sendMessage(from, { 
                    text: `💬 *${q.text}*\n\n- ${q.author}` 
                });
            }
        }
    },

    pantun: {
        name: 'pantun',
        description: 'Random pantun',
        execute: async ({ sock, from }) => {
            const pantuns = [
                "Buah mangga buah kedondong,\nJangan dibuang sampah sembarang.",
                "Pergi ke pasar membeli ikan,\nJangan lupa cuci tangan.",
                "Ke Makassar naik pesawat,\nJangan lupa bawa paspor."
            ];
            
            await sock.sendMessage(from, { 
                text: `🎭 *PANTUN*\n\n${pantuns[Math.floor(Math.random() * pantuns.length)]}` 
            });
        }
    },

    fakta: {
        name: 'fakta',
        aliases: ['fact'],
        description: 'Fakta unik',
        execute: async ({ sock, from }) => {
            try {
                const res = await axios.get('https://api.akuari.my.id/randomtext/faktaunik');
                await sock.sendMessage(from, { 
                    text: `🤔 *FAKTA UNIK*\n\n${res.data.result || 'Tidak ada fakta.'}` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengambil fakta.' });
            }
        }
    },

    bijak: {
        name: 'bijak',
        aliases: ['katabijak'],
        description: 'Kata-kata bijak',
        execute: async ({ sock, from }) => {
            try {
                const res = await axios.get('https://api.akuari.my.id/randomtext/katabijak');
                await sock.sendMessage(from, { 
                    text: `🦉 *KATA BIJAK*\n\n${res.data.result || 'Tidak ada data.'}` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengambil data.' });
            }
        }
    },

    puisi: {
        name: 'puisi',
        description: 'Random puisi',
        execute: async ({ sock, from }) => {
            try {
                const res = await axios.get('https://api.akuari.my.id/randomtext/puisi');
                const p = res.data.result;
                if (p) {
                    await sock.sendMessage(from, { 
                        text: `📜 *PUISI: ${p.title}*\n\n${p.puisi}\n\n- ${p.author}` 
                    });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengambil puisi.' });
            }
        }
    },

    dare: {
        name: 'dare',
        description: 'Tantangan',
        execute: async ({ sock, from }) => {
            const dares = [
                "Kirim pesan 'Aku sayang kamu' ke crushmu.",
                "Update status WA dengan foto jelekmu.",
                "Telepon nomor random dan nyanyi.",
                "Kirim voice note teriak 'Aku bot!'"
            ];
            
            await sock.sendMessage(from, { 
                text: `😈 *DARE*\n\n${dares[Math.floor(Math.random() * dares.length)]}` 
            });
        }
    },

    truth: {
        name: 'truth',
        description: 'Kejujuran',
        execute: async ({ sock, from }) => {
            const truths = [
                "Siapa crushmu sekarang?",
                "Kapan terakhir kali kamu bohong?",
                "Apa rahasia terbesarmu?",
                "Siapa mantan yang paling kamu sesali?"
            ];
            
            await sock.sendMessage(from, { 
                text: `🤫 *TRUTH*\n\n${truths[Math.floor(Math.random() * truths.length)]}` 
            });
        }
    }
};

module.exports = { commands };