// ============================================
// GROUP: WELCOME & GOODBYE
// ============================================

const { downloadContentFromMessage } = require('@adiwajshing/baileys');

const commands = {
    welcome: {
        name: 'welcome',
        aliases: ['wc'],
        description: 'Toggle welcome message',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            group.welcome = args[0] === 'on';
            db.saveGroup(from, group);

            await sock.sendMessage(from, { 
                text: `👋 Welcome ${group.welcome ? 'ON' : 'OFF'}` 
            });
        }
    },

    goodbye: {
        name: 'goodbye',
        aliases: ['gb'],
        description: 'Toggle goodbye message',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            group.goodbye = args[0] === 'on';
            db.saveGroup(from, group);

            await sock.sendMessage(from, { 
                text: `👋 Goodbye ${group.goodbye ? 'ON' : 'OFF'}` 
            });
        }
    },

    setwelcome: {
        name: 'setwelcome',
        description: 'Set custom welcome message',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .setwelcome <text>\n\nUse @user untuk mention' 
                });
            }

            const group = db.getGroup(from) || {};
            group.welcomeText = args.join(' ');
            db.saveGroup(from, group);

            await sock.sendMessage(from, { text: '✅ Welcome message diupdate!' });
        }
    },

    setgoodbye: {
        name: 'setgoodbye',
        description: 'Set custom goodbye message',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .setgoodbye <text>' });
            }

            const group = db.getGroup(from) || {};
            group.goodbyeText = args.join(' ');
            db.saveGroup(from, group);

            await sock.sendMessage(from, { text: '✅ Goodbye message diupdate!' });
        }
    }
};

// Handler untuk event group participant update
async function handleParticipantUpdate(sock, update, db) {
    const { id, participants, action } = update;
    const group = db.getGroup(id);

    if (!group) return;

    for (const participant of participants) {
        if (action === 'add' && group.welcome) {
            const text = group.welcomeText || 
                `👋 Welcome @${participant.split('@')[0]} to the group!`;
            
            await sock.sendMessage(id, { 
                text, 
                mentions: [participant] 
            });
        } else if (action === 'remove' && group.goodbye) {
            const text = group.goodbyeText || 
                `👋 Goodbye @${participant.split('@')[0]}!`;
            
            await sock.sendMessage(id, { 
                text, 
                mentions: [participant] 
            });
        }
    }
}

module.exports = { commands, handleParticipantUpdate };