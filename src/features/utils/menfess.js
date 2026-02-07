// ============================================
// UTILS: MENFESS / CONFESS ANONYMOUS
// ============================================

const sessions = new Map();

const commands = {
    menfess: {
        name: 'menfess',
        aliases: ['confess', 'menfes'],
        description: 'Kirim pesan anonim',
        execute: async ({ sock, from, args, sender }) => {
            if (args.length < 2) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .menfess <nomor> <pesan>\nContoh: .menfess 628xxx Halo, aku suka kamu...' 
                });
            }

            const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            const message = args.slice(1).join(' ');

            try {
                await sock.sendMessage(target, {
                    text: `📩 *PESAN ANONIM*\n\n${message}\n\n_💌 Dari seseorang yang peduli_`
                });

                await sock.sendMessage(from, { 
                    text: '✅ Pesan anonim terkirim!' 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengirim pesan.' });
            }
        }
    },

    confes: {
        name: 'confes',
        aliases: ['cf'],
        description: 'Mode confes interaktif',
        execute: async ({ sock, from, sender }) => {
            sessions.set(sender, { step: 1, data: {} });
            await sock.sendMessage(from, { 
                text: '💌 *MODE CONFES*\n\nStep 1: Kirim nomor target\nFormat: .to 628xxx' 
            });
        }
    },

    to: {
        name: 'to',
        description: 'Set target confes',
        execute: async ({ sock, from, args, sender }) => {
            const session = sessions.get(sender);
            if (!session || session.step !== 1) return;

            session.data.target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            session.step = 2;
            
            await sock.sendMessage(from, { 
                text: 'Step 2: Kirim pesanmu\nFormat: .msg <pesan kamu>' 
            });
        }
    },

    msg: {
        name: 'msg',
        description: 'Set pesan confes',
        execute: async ({ sock, from, args, sender }) => {
            const session = sessions.get(sender);
            if (!session || session.step !== 2) return;

            session.data.message = args.join(' ');
            session.step = 3;

            await sock.sendMessage(from, { 
                text: `📋 *KONFIRMASI*\n\nTo: ${session.data.target.split('@')[0]}\nMessage: ${session.data.message}\n\nKirim? .send` 
            });
        }
    },

    send: {
        name: 'send',
        description: 'Kirim confes',
        execute: async ({ sock, from, sender }) => {
            const session = sessions.get(sender);
            if (!session || session.step !== 3) return;

            try {
                await sock.sendMessage(session.data.target, {
                    text: `💌 *CONFESSION*\n\n${session.data.message}\n\n_✨ Dari seseorang yang menyukaimu_`
                });

                await sock.sendMessage(from, { text: '✅ Confession terkirim!' });
                sessions.delete(sender);
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal mengirim.' });
            }
        }
    },

    cancel: {
        name: 'cancel',
        description: 'Batal confes',
        execute: async ({ sock, from, sender }) => {
            sessions.delete(sender);
            await sock.sendMessage(from, { text: '❌ Confes dibatalkan.' });
        }
    }
};

module.exports = { commands };