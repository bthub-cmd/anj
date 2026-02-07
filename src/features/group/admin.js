// ============================================
// GROUP: ADMIN TOOLS
// ============================================

const commands = {
    kick: {
        name: 'kick',
        aliases: ['k', 'remove'],
        description: 'Kick member dari grup',
        groupOnly: true,
        execute: async ({ sock, from, msg, args }) => {
            if (!msg.key.participant) {
                return await sock.sendMessage(from, { text: '❌ Hanya untuk grup!' });
            }

            // Check admin
            const groupMetadata = await sock.groupMetadata(from);
            const isAdmin = groupMetadata.participants.find(p => p.id === msg.key.participant)?.admin;
            
            if (!isAdmin) {
                return await sock.sendMessage(from, { text: '⛔ Hanya admin!' });
            }

            // Get target
            let target = args[0];
            if (!target && msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            if (!target) {
                return await sock.sendMessage(from, { text: '⚠️ Tag member yang mau dikick!' });
            }

            try {
                await sock.groupParticipantsUpdate(from, [target], 'remove');
                await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} dikick!`, mentions: [target] });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal kick member.' });
            }
        }
    },

    add: {
        name: 'add',
        description: 'Tambah member ke grup',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .add 628xxx' });
            }

            const number = args[0].replace(/[^0-9]/g, '');
            const jid = number + '@s.whatsapp.net';

            try {
                await sock.groupParticipantsUpdate(from, [jid], 'add');
                await sock.sendMessage(from, { text: `✅ @${number} ditambahkan!`, mentions: [jid] });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal menambahkan. Mungkin privat?' });
            }
        }
    },

    promote: {
        name: 'promote',
        aliases: ['pm', 'admin'],
        description: 'Jadikan admin',
        groupOnly: true,
        execute: async ({ sock, from, msg, args }) => {
            let target = args[0];
            if (!target && msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            if (!target) {
                return await sock.sendMessage(from, { text: '⚠️ Tag target!' });
            }

            try {
                await sock.groupParticipantsUpdate(from, [target], 'promote');
                await sock.sendMessage(from, { text: `⬆️ @${target.split('@')[0]} jadi admin!`, mentions: [target] });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal promote.' });
            }
        }
    },

    demote: {
        name: 'demote',
        aliases: ['dm'],
        description: 'Turunkan admin',
        groupOnly: true,
        execute: async ({ sock, from, msg, args }) => {
            let target = args[0];
            if (!target && msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            if (!target) {
                return await sock.sendMessage(from, { text: '⚠️ Tag target!' });
            }

            try {
                await sock.groupParticipantsUpdate(from, [target], 'demote');
                await sock.sendMessage(from, { text: `⬇️ @${target.split('@')[0]} diturunkan!`, mentions: [target] });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal demote.' });
            }
        }
    },

    tagall: {
        name: 'tagall',
        aliases: ['all', 'everyone'],
        description: 'Tag semua member',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants.map(p => p.id);
            
            const message = args.length ? args.join(' ') : '👋 Attention everyone!';
            let text = `${message}\n\n`;
            
            participants.forEach(jid => {
                text += `@${jid.split('@')[0]} `;
            });

            await sock.sendMessage(from, { text, mentions: participants });
        }
    },

    hidetag: {
        name: 'hidetag',
        aliases: ['ht'],
        description: 'Hidden tag (tag tanpa mention)',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants.map(p => p.id);
            
            const message = args.join(' ') || '👋 Hidden message';
            
            await sock.sendMessage(from, { 
                text: message, 
                mentions: participants 
            });
        }
    },

    groupinfo: {
        name: 'groupinfo',
        aliases: ['ginfo', 'grupinfo'],
        description: 'Info grup',
        groupOnly: true,
        execute: async ({ sock, from }) => {
            const groupMetadata = await sock.groupMetadata(from);
            
            const text = `📊 *GROUP INFO*

📛 Nama: ${groupMetadata.subject}
👥 Member: ${groupMetadata.participants.length}
📝 Deskripsi: ${groupMetadata.desc || 'Tidak ada'}
👑 Owner: @${groupMetadata.owner?.split('@')[0] || 'Unknown'}
📅 Dibuat: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}`;

            await sock.sendMessage(from, { text, mentions: groupMetadata.owner ? [groupMetadata.owner] : [] });
        }
    },

    listonline: {
        name: 'listonline',
        aliases: ['here', 'online'],
        description: 'List member yang online',
        groupOnly: true,
        execute: async ({ sock, from }) => {
            const id = from;
            const online = [...sock.chats.get(id).presences.keys()];
            
            if (!online.length) {
                return await sock.sendMessage(from, { text: 'Tidak ada yang online.' });
            }

            let text = `💚 *ONLINE MEMBERS (${online.length})*\n\n`;
            online.forEach(jid => {
                text += `• @${jid.split('@')[0]}\n`;
            });

            await sock.sendMessage(from, { text, mentions: online });
        }
    }
};

module.exports = { commands };