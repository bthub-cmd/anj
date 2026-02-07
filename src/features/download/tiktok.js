// ============================================
// DOWNLOAD: TIKTOK
// ============================================

const axios = require('axios');

const commands = {
    tiktok: {
        name: 'tiktok',
        aliases: ['tt', 'ttdl'],
        description: 'Download TikTok video',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .tiktok <url>' 
                });
            }

            const url = args[0];
            if (!url.includes('tiktok.com')) {
                return await sock.sendMessage(from, { text: '❌ Invalid TikTok URL' });
            }

            await sock.sendMessage(from, { text: '⏳ Processing...' });

            try {
                // Using external API (free tier)
                const apiUrl = `https://api.akuari.my.id/downloader/tiktok?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon && res.data.respon.hd) {
                    await sock.sendMessage(from, {
                        video: { url: res.data.respon.hd },
                        caption: `🎵 *${res.data.respon.author || 'TikTok'}*\n❤️ ${res.data.respon.likes || 0} | 💬 ${res.data.respon.comments || 0}`
                    });
                } else {
                    throw new Error('No video found');
                }
            } catch (e) {
                // Fallback: try alternative API
                try {
                    const altApi = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
                    const altRes = await axios.get(altApi);
                    // Process and send...
                    await sock.sendMessage(from, { text: '⚠️ Try alternative method' });
                } catch (altE) {
                    await sock.sendMessage(from, { text: '❌ Failed to download' });
                }
            }
        }
    },

    tiktokmp3: {
        name: 'tiktokmp3',
        aliases: ['ttmp3', 'tiktokaudio'],
        description: 'Download TikTok audio',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .tiktokmp3 <url>' 
                });
            }

            await sock.sendMessage(from, { text: '⏳ Extracting audio...' });

            try {
                // Implementation similar to tiktok but extract audio
                await sock.sendMessage(from, { text: '🎵 (Audio extraction - implementasi detail)' });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    }
};

module.exports = { commands };