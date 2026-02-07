// ============================================
// DOWNLOAD: TWITTER/X
// ============================================

const axios = require('axios');

const commands = {
    twitter: {
        name: 'twitter',
        aliases: ['twt', 'x'],
        description: 'Download Twitter/X media',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .twitter <url>' 
                });
            }

            const url = args[0];
            if (!url.includes('twitter.com') && !url.includes('x.com')) {
                return await sock.sendMessage(from, { text: '❌ Invalid Twitter URL' });
            }

            await sock.sendMessage(from, { text: '⏳ Processing...' });

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/twitter?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon && res.data.respon.video) {
                    await sock.sendMessage(from, {
                        video: { url: res.data.respon.video },
                        caption: `🐦 Twitter Video\n👤 ${res.data.respon.user || 'Unknown'}`
                    });
                } else if (res.data.respon && res.data.respon.image) {
                    await sock.sendMessage(from, {
                        image: { url: res.data.respon.image },
                        caption: '🐦 Twitter Image'
                    });
                } else {
                    throw new Error('No media found');
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Failed to download' });
            }
        }
    }
};

module.exports = { commands };