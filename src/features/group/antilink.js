// ============================================
// GROUP: ANTI-LINK SYSTEM
// ============================================

const linkRegex = {
    whatsapp: /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i,
    telegram: /t.me\/([a-zA-Z0-9_]{5,32})/i,
    youtube: /youtube.com|youtu.be/i,
    instagram: /instagram.com/i,
    facebook: /facebook.com|fb.me/i,
    twitter: /twitter.com|x.com/i,
    all: /(https?:\/\/[^\s]+)/gi
};

const commands = {
    antilink: {
        name: 'antilink',
        aliases: ['antil'],
        description: 'Toggle anti-link',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .antilink <on/off/action>\nAction: delete/kick/warn' 
                });
            }

            const sub = args[0].toLowerCase();
            
            if (sub === 'on' || sub === 'off') {
                group.antilink = sub === 'on';
                db.saveGroup(from, group);
                return await sock.sendMessage(from, { 
                    text: `🔗 Anti-link ${sub.toUpperCase()}` 
                });
            }

            if (['delete', 'kick', 'warn'].includes(sub)) {
                group.antilinkAction = sub;
                db.saveGroup(from, group);
                return await sock.sendMessage(from, { 
                    text: `🔗 Anti-link action: ${sub}` 
                });
            }
        }
    },

    antilinkwa: {
        name: 'antilinkwa',
        description: 'Anti-link WhatsApp only',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            group.antilinkWa = args[0] === 'on';
            db.saveGroup(from, group);
            
            await sock.sendMessage(from, { 
                text: `🔗 Anti-link WhatsApp ${group.antilinkWa ? 'ON' : 'OFF'}` 
            });
        }
    },

    antilinkall: {
        name: 'antilinkall',
        description: 'Anti semua jenis link',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            group.antilinkAll = args[0] === 'on';
            db.saveGroup(from, group);
            
            await sock.sendMessage(from, { 
                text: `🔗 Anti-link ALL ${group.antilinkAll ? 'ON' : 'OFF'}` 
            });
        }
    }
};

// Check message for links
async function checkLink(sock, msg, from, sender, db) {
    const group = db.getGroup(from);
    if (!group) return false;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || '';

    let detected = null;
    let type = '';

    if (group.antilinkWa && linkRegex.whatsapp.test(text)) {
        detected = text.match(linkRegex.whatsapp)[0];
        type = 'WhatsApp';
    } else if (group.antilinkAll && linkRegex.all.test(text)) {
        detected = text.match(linkRegex.all)[0];
        type = 'Link';
    }

    if (!detected) return false;

    const action = group.antilinkAction || 'delete';

    // Delete message
    await sock.sendMessage(from, { delete: msg.key });

    if (action === 'warn') {
        await sock.sendMessage(from, { 
            text: `⚠️ @${sender.split('@')[0]} jangan kirim link ${type}!`,
            mentions: [sender]
        });
    } else if (action === 'kick') {
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        await sock.sendMessage(from, { 
            text: `🚫 @${sender.split('@')[0]} dikick karena kirim link!`,
            mentions: [sender]
        });
    } else {
        await sock.sendMessage(from, { 
            text: `🗑️ Link ${type} dihapus.` 
        });
    }

    return true;
}

module.exports = { commands, checkLink };