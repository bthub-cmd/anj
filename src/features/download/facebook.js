// ============================================
// DOWNLOAD: FACEBOOK
// ============================================

const axios = require('axios');

const commands = {
    fb: {
        name: 'fb',
        aliases: ['facebook', 'fbdl'],
        description: 'Download Facebook video',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .fb <url>' 
                });
            }

            const url = args[0];
            if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                return await sock.sendMessage(from, { text: '❌ Invalid Facebook URL' });
            }

            await sock.sendMessage(from, { text: '⏳ Processing...' });

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/fb?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon && res.data.respon.hd) {
                    await sock.sendMessage(from, {
                        video: { url: res.data.respon.hd },
                        caption: `📘 Facebook Video\n👁️ ${res.data.respon.views || 'Unknown'} views`
                    });
                } else if (res.data.respon && res.data.respon.sd) {
                    await sock.sendMessage(from, {
                        video: { url: res.data.respon.sd },
                        caption: '📘 Facebook Video (SD)'
                    });
                } else {
                    throw new Error('No video found');
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Failed to download' });
            }
        }
    }
};

module.exports = { commands };