// ============================================
// GAMES: TEBAK-TEBAKAN
// ============================================

// Session storage untuk game aktif
const sessions = new Map();

const questions = {
    kata: [
        { q: 'Apa ibu kota Indonesia?', a: 'jakarta' },
        { q: 'Hewan apa yang paling besar di dunia?', a: 'paus biru' },
        { q: 'Planet keberapa Bumi dari Matahari?', a: 'ketiga' },
        { q: 'Siapa penemu lampu pijar?', a: 'thomas edison' },
        { q: 'Berapa jumlah provinsi di Indonesia?', a: '38' }
    ],
    gambar: [
        // Dalam implementasi nyata, ini URL gambar dengan jawaban
        { url: 'https://example.com/gambar1.jpg', a: 'harimau' },
        { url: 'https://example.com/gambar2.jpg', a: 'monas' }
    ],
    bendera: [
        { emoji: '🇯🇵', a: 'jepang' },
        { emoji: '🇰🇷', a: 'korea selatan' },
        { emoji: '🇫🇷', a: 'prancis' },
        { emoji: '🇧🇷', a: 'brasil' },
        { emoji: '🇮🇳', a: 'india' }
    ]
};

const commands = {
    tebakkata: {
        name: 'tebakkata',
        aliases: ['teka'],
        description: 'Tebak kata/kuis',
        execute: async ({ sock, from }) => {
            if (sessions.has(from)) {
                return await sock.sendMessage(from, { 
                    text: '⏳ Masih ada game berlangsung! Ketik .nyerah untuk menyerah.' 
                });
            }

            const q = questions.kata[Math.floor(Math.random() * questions.kata.length)];
            sessions.set(from, { type: 'kata', answer: q.a, attempts: 0 });

            await sock.sendMessage(from, { 
                text: `🤔 *TEBAK KATA*\n\n${q.q}\n\n💡 Ketik jawabanmu:` 
            });
        }
    },

    tebakbendera: {
        name: 'tebakbendera',
        aliases: ['tebe'],
        description: 'Tebak bendera negara',
        execute: async ({ sock, from }) => {
            if (sessions.has(from)) {
                return await sock.sendMessage(from, { text: '⏳ Masih ada game!' });
            }

            const q = questions.bendera[Math.floor(Math.random() * questions.bendera.length)];
            sessions.set(from, { type: 'bendera', answer: q.a });

            await sock.sendMessage(from, { 
                text: `🏳️ *TEBAK BENDERA*\n\n${q.emoji}\n\nNegara apa ini?` 
            });
        }
    },

    cekjawaban: {
        name: 'cek',
        description: 'Cek jawaban (auto-detect)',
        execute: async ({ sock, from, text, sender, db }) => {
            const session = sessions.get(from);
            if (!session) return; // Tidak ada game aktif

            const answer = text.toLowerCase().trim();
            session.attempts++;

            if (answer === session.answer) {
                // Benar!
                sessions.delete(from);
                
                // Reward
                const reward = 100 + Math.floor(Math.random() * 50);
                const user = db.getUser(sender) || {};
                user.money = (user.money || 0) + reward;
                db.saveUser(sender, user);

                await sock.sendMessage(from, { 
                    text: `🎉 *BENAR!*\n\n💰 +$${reward}\n💵 Total: $${user.money}` 
                });
            } else if (session.attempts >= 3) {
                // Gagal
                sessions.delete(from);
                await sock.sendMessage(from, { 
                    text: `❌ *GAME OVER*\n\nJawaban yang benar: *${session.answer}*` 
                });
            } else {
                // Salah, masih ada kesempatan
                await sock.sendMessage(from, { 
                    text: `❌ Salah! (${session.attempts}/3 kesempatan)` 
                });
            }
        }
    },

    nyerah: {
        name: 'nyerah',
        aliases: ['surrender', 'menyerah'],
        description: 'Menyerah dari game',
        execute: async ({ sock, from }) => {
            const session = sessions.get(from);
            if (!session) {
                return await sock.sendMessage(from, { text: 'Tidak ada game aktif.' });
            }

            sessions.delete(from);
            await sock.sendMessage(from, { 
                text: `🏳️ Kamu menyerah!\nJawaban: *${session.answer}*` 
            });
        }
    }
};

module.exports = { commands };