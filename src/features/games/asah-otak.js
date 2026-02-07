// ============================================
// GAMES: ASAH OTAK & SUSUN KATA
// ============================================

const sessions = new Map();

const asahOtak = [
    { q: 'Apa yang punya leher tapi tidak punya kepala?', a: 'botol' },
    { q: 'Apa yang selalu basah meski dijemur?', a: 'air' },
    { q: 'Apa yang punya gigi tapi tidak bisa mengunyah?', a: 'sisir' },
    { q: 'Apa yang naik turun tapi tidak bergerak?', a: 'tangga' },
    { q: 'Apa yang bisa dipecahkan tapi tidak bisa dilihat?', a: 'rekor' },
    { q: 'Apa yang punya satu mata tapi tidak bisa melihat?', a: 'jarum' },
    { q: 'Apa yang makin diambil makin besar?', a: 'lubang' }
];

const susunKataList = [
    { scrambled: 'a k n s a i', answer: 'nasi' },
    { scrambled: 'g r e n a d', answer: 'rendang' },
    { scrambled: 'j k a a r t', answer: 'jakarta' },
    { scrambled: 'p n s o e i s a', answer: 'indonesia' },
    { scrambled: 'w h a s t a p p', answer: 'whatsapp' }
];

const commands = {
    asahotak: {
        name: 'asahotak',
        aliases: ['ao', 'teka-teki'],
        description: 'Asah otak/teka-teki',
        execute: async ({ sock, from }) => {
            if (sessions.has(from)) {
                return await sock.sendMessage(from, { text: '⏳ Masih ada soal!' });
            }

            const q = asahOtak[Math.floor(Math.random() * asahOtak.length)];
            sessions.set(from, { type: 'asahotak', answer: q.a });

            await sock.sendMessage(from, { 
                text: `🧠 *ASAH OTAK*\n\n${q.q}\n\n💭 Jawaban?` 
            });
        }
    },

    susunkata: {
        name: 'susunkata',
        aliases: ['sk', 'susun'],
        description: 'Susun kata acak',
        execute: async ({ sock, from }) => {
            if (sessions.has(from)) {
                return await sock.sendMessage(from, { text: '⏳ Masih ada soal!' });
            }

            const q = susunKataList[Math.floor(Math.random() * susunKataList.length)];
            sessions.set(from, { type: 'susunkata', answer: q.answer });

            await sock.sendMessage(from, { 
                text: `📝 *SUSUN KATA*\n\nSusun huruf ini:\n*${q.scrambled}*\n\n🤔 Kata apa ini?` 
            });
        }
    },

    jawabgame: {
        name: 'jawabgame',
        description: 'Jawab asah otak/susun kata (auto)',
        execute: async ({ sock, from, text, sender, db }) => {
            const session = sessions.get(from);
            if (!session) return;

            const answer = text.toLowerCase().trim();
            
            if (answer === session.answer) {
                sessions.delete(from);
                
                const reward = 50;
                const user = db.getUser(sender) || {};
                user.money = (user.money || 0) + reward;
                db.saveUser(sender, user);

                await sock.sendMessage(from, { 
                    text: `🎉 *BENAR!*\n\n💰 +$${reward}\n💵 Total: $${user.money}` 
                });
            } else {
                await sock.sendMessage(from, { text: '❌ Salah, coba lagi!' });
            }
        }
    },

    hint: {
        name: 'hint',
        aliases: ['bantuan', 'petunjuk'],
        description: 'Petunjuk jawaban',
        execute: async ({ sock, from }) => {
            const session = sessions.get(from);
            if (!session) {
                return await sock.sendMessage(from, { text: 'Tidak ada game aktif.' });
            }

            const answer = session.answer;
            const hint = answer.substring(0, Math.ceil(answer.length / 2)) + '...';
            
            await sock.sendMessage(from, { 
                text: `💡 *PETUNJUK*\n\nJawaban dimulai dengan: *${hint}*` 
            });
        }
    }
};

module.exports = { commands };