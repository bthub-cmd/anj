// ============================================
// GAMES: FAMILY 100 (INDONESIA)
// ============================================

const sessions = new Map();

const surveys = [
    {
        question: 'Sebutkan makanan khas Indonesia!',
        answers: [
            { text: 'nasi goreng', points: 35 },
            { text: 'rendang', points: 25 },
            { text: 'sate', points: 20 },
            { text: 'gado-gado', points: 10 },
            { text: 'soto', points: 10 }
        ]
    },
    {
        question: 'Sebutkan hewan yang bisa terbang!',
        answers: [
            { text: 'burung', points: 40 },
            { text: 'kelelawar', points: 30 },
            { text: 'kupu-kupu', points: 20 },
            { text: 'lebah', points: 10 }
        ]
    },
    {
        question: 'Sebutkan alat elektronik di rumah!',
        answers: [
            { text: 'tv', points: 30 },
            { text: 'kulkas', points: 25 },
            { text: 'mesin cuci', points: 20 },
            { text: 'kipas angin', points: 15 },
            { text: 'komputer', points: 10 }
        ]
    }
];

const commands = {
    family100: {
        name: 'family100',
        aliases: ['fam', 'family'],
        description: 'Game Family 100',
        execute: async ({ sock, from }) => {
            if (sessions.has(from)) {
                return await sock.sendMessage(from, { text: '⏳ Game masih berlangsung!' });
            }

            const survey = surveys[Math.floor(Math.random() * surveys.length)];
            const session = {
                question: survey.question,
                answers: survey.answers,
                found: [],
                players: new Map()
            };
            
            sessions.set(from, session);

            await sock.sendMessage(from, { 
                text: `📊 *FAMILY 100*\n\n${survey.question}\n\n🎯 ${survey.answers.length} jawaban tersedia!\n💬 Kirim jawabanmu!` 
            });
        }
    },

    jawab: {
        name: 'jawab',
        description: 'Jawab Family 100 (auto-detect)',
        execute: async ({ sock, from, text, sender }) => {
            const session = sessions.get(from);
            if (!session) return;

            const answer = text.toLowerCase().trim();
            
            // Cek apakah jawaban sudah ditemukan
            if (session.found.includes(answer)) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Jawaban sudah ditemukan!' 
                });
            }

            // Cek jawaban
            const correct = session.answers.find(a => a.text === answer);
            if (correct) {
                session.found.push(answer);
                
                // Tambah poin pemain
                const currentPoints = session.players.get(sender) || 0;
                session.players.set(sender, currentPoints + correct.points);

                let text = `✅ *BENAR!*\n`;
                text += `📝 ${correct.text.toUpperCase()}\n`;
                text += `⭐ ${correct.points} poin!\n\n`;
                text += `📊 Progress: ${session.found.length}/${session.answers.length}\n`;
                text += `🎯 Sisa: ${session.answers.filter(a => !session.found.includes(a.text)).length} jawaban`;

                await sock.sendMessage(from, { text });

                // Cek game selesai
                if (session.found.length === session.answers.length) {
                    await endGame(sock, from, session);
                }
            }
        }
    },

    skor: {
        name: 'skor',
        aliases: ['score', 'poin'],
        description: 'Lihat skor Family 100',
        execute: async ({ sock, from }) => {
            const session = sessions.get(from);
            if (!session) {
                return await sock.sendMessage(from, { text: 'Tidak ada game aktif.' });
            }

            let text = `📊 *SKOR SEMENTARA*\n\n`;
            const sorted = [...session.players.entries()].sort((a, b) => b[1] - a[1]);
            
            sorted.forEach(([player, points], i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
                text += `${medal} @${player.split('@')[0]}: ${points} poin\n`;
            });

            await sock.sendMessage(from, { text, mentions: sorted.map(s => s[0]) });
        }
    },

    stopfam: {
        name: 'stopfam',
        aliases: ['stopfamily', 'akhiri'],
        description: 'Akhiri game Family 100',
        execute: async ({ sock, from }) => {
            const session = sessions.get(from);
            if (!session) {
                return await sock.sendMessage(from, { text: 'Tidak ada game aktif.' });
            }

            await endGame(sock, from, session);
            sessions.delete(from);
        }
    }
};

async function endGame(sock, from, session) {
    let text = `🎉 *GAME SELESAI!*\n\n`;
    text += `📋 Jawaban:\n`;
    session.answers.forEach(a => {
        const found = session.found.includes(a.text) ? '✅' : '❌';
        text += `${found} ${a.text.toUpperCase()} (${a.points})\n`;
    });

    text += `\n🏆 *PEMENANG:*\n`;
    const sorted = [...session.players.entries()].sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 3).forEach(([player, points], i) => {
        const medal = ['🥇', '🥈', '🥉'][i];
        text += `${medal} @${player.split('@')[0]}: ${points} poin\n`;
    });

    await sock.sendMessage(from, { text, mentions: sorted.map(s => s[0]) });
}

module.exports = { commands };