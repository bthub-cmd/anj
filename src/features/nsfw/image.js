// ============================================
// NSFW: IMAGE COMMANDS
// ============================================

const axios = require('axios');
const config = require('./config');

const commands = {
    waifu: {
        name: 'waifu',
        description: 'Random NSFW waifu',
        execute: async ({ sock, from, config: botConfig }) => {
            if (!botConfig.nsfw) return;
            
            try {
                const res = await axios.get('https://api.waifu.im/search/?is_nsfw=true');
                const image = res.data.images[0];
                
                await sock.sendMessage(from, {
                    image: { url: image.url },
                    caption: `🔞 Waifu - ${image.artist?.name || 'Unknown'}`
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error fetching image' });
            }
        }
    },

    neko: {
        name: 'neko',
        description: 'Random NSFW neko',
        execute: async ({ sock, from, config: botConfig }) => {
            if (!botConfig.nsfw) return;
            
            try {
                const res = await axios.get('https://nekos.life/api/v2/img/nsfw_neko_gif');
                await sock.sendMessage(from, {
                    video: { url: res.data.url },
                    caption: '🔞 Neko'
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    },

    hentai: {
        name: 'hentai',
        aliases: ['h'],
        description: 'Random hentai',
        execute: async ({ sock, from, config: botConfig }) => {
            if (!botConfig.nsfw) return;
            
            try {
                const res = await axios.get('https://nekos.life/api/v2/img/hentai');
                await sock.sendMessage(from, {
                    image: { url: res.data.url },
                    caption: '🔞 Hentai'
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    },

    trap: {
        name: 'trap',
        description: 'Random trap',
        execute: async ({ sock, from, config: botConfig }) => {
            if (!botConfig.nsfw) return;
            
            try {
                const res = await axios.get('https://nekos.life/api/v2/img/trap');
                await sock.sendMessage(from, {
                    image: { url: res.data.url },
                    caption: '🔞 Trap'
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    }
};

module.exports = { commands };