// ============================================
// NSFW: MAIN CONTROLLER
// ============================================

const config = require('./config');
const axios = require('axios');

const commands = {
    nsfw: {
        name: 'nsfw',
        aliases: ['hentai', 'lewd'],
        description: 'Random NSFW image by category',
        cooldown: config.cooldown,
        execute: async ({ sock, from, args, config: botConfig }) => {
            if (!botConfig.nsfw) {
                return await sock.sendMessage(from, { 
                    text: '🔞 NSFW dinonaktifkan oleh owner.' 
                });
            }

            const category = args[0] || 'waifu';
            if (!config.categories.images.includes(category)) {
                return await sock.sendMessage(from, {
                    text: `📋 Kategori tersedia:\n${config.categories.images.join(', ')}`
                });
            }

            try {
                let url;
                if (category === 'waifu') {
                    const res = await axios.get(config.apis.waifu);
                    url = res.data.images[0].url;
                } else if (category === 'neko') {
                    const res = await axios.get(config.apis.nekos + 'lewd');
                    url = res.data.url;
                } else {
                    // Fallback random
                    url = `https://api.waifu.im/search/?included_tags=${category}`;
                }

                await sock.sendMessage(from, { 
                    image: { url },
                    caption: `🔞 Category: ${category}`
                });
            } catch (error) {
                await sock.sendMessage(from, { 
                    text: '❌ Gagal mengambil gambar.' 
                });
            }
        }
    },

    nsfwmenu: {
        name: 'nsfwmenu',
        description: 'List NSFW commands',
        execute: async ({ sock, from }) => {
            const text = `🔞 *NSFW MENU*

*Images:*
• ${config.categories.images.join('\n• ')}

*Videos:*
• ${config.categories.videos.join('\n• ')}

*Usage:* .nsfw <category>`;

            await sock.sendMessage(from, { text });
        }
    }
};

module.exports = { commands };