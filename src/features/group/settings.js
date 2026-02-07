// ============================================
// GROUP: SETTINGS
// ============================================

const commands = {
    group: {
        name: 'group',
        aliases: ['gc'],
        description: 'Open/close group',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            const action = args[0]?.toLowerCase();
            
            if (!['open', 'close'].includes(action)) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .group <open/close>' 
                });
            }

            try {
                await sock.groupSettingUpdate(from, action === 'close' ? 'announcement' : 'not_announcement');
                await sock.sendMessage(from, { 
                    text: `🔒 Group ${action === 'close' ? 'CLOSED' : 'OPENED'}` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal update group.' });
            }
        }
    },

    setname: {
        name: 'setname',
        aliases: ['subject', 'setsubject'],
        description: 'Ganti nama grup',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .setname <nama>' });
            }

            const name = args.join(' ');
            if (name.length > 25) {
                return await sock.sendMessage(from, { text: '❌ Nama terlalu panjang (max 25)' });
            }

            try {
                await sock.groupUpdateSubject(from, name);
                await sock.sendMessage(from, { text: `✅ Nama grup diubah ke: ${name}` });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal ganti nama.' });
            }
        }
    },

    setdesc: {
        name: 'setdesc',
        aliases: ['description', 'deskripsi'],
        description: 'Ganti deskripsi grup',
        groupOnly: true,
        execute: async ({ sock, from, args }) => {
            const desc = args.join(' ') || '';
            
            try {
                await sock.groupUpdateDescription(from, desc);
                await sock.sendMessage(from, { text: '✅ Deskripsi diupdate!' });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal update deskripsi.' });
            }
        }
    },

    link: {
        name: 'link',
        aliases: ['gclink', 'invitelink'],
        description: 'Get group invite link',
        groupOnly: true,
        execute: async ({ sock, from }) => {
            try {
                const code = await sock.groupInviteCode(from);
                await sock.sendMessage(from, { 
                    text: `🔗 *Group Link*\n\nhttps://chat.whatsapp.com/${code}` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal get link.' });
            }
        }
    },

    revoke: {
        name: 'revoke',
        aliases: ['resetlink', 'revokelink'],
        description: 'Reset invite link',
        groupOnly: true,
        execute: async ({ sock, from }) => {
            try {
                await sock.groupRevokeInvite(from);
                await sock.sendMessage(from, { text: '✅ Link direset! Gunakan .link untuk yang baru.' });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal reset link.' });
            }
        }
    },

    mute: {
        name: 'mute',
        description: 'Mute bot di grup ini',
        groupOnly: true,
        execute: async ({ sock, from, args, db }) => {
            const group = db.getGroup(from) || {};
            group.mute = args[0] === 'on';
            db.saveGroup(from, group);

            await sock.sendMessage(from, { 
                text: `🔇 Bot ${group.mute ? 'MUTED' : 'UNMUTED'} di grup ini` 
            });
        }
    }
};

module.exports = { commands };