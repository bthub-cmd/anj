// ============================================
// DOWNLOAD: INSTAGRAM
// ============================================

const axios = require('axios');

const commands = {
    ig: {
        name: 'ig',
        aliases: ['instagram', 'igdl'],
        description: 'Download Instagram media',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .ig <url>' 
                });
            }

            const url = args[0];
            if (!url.includes('instagram.com')) {
                return await sock.sendMessage(from, { text: '❌ Invalid Instagram URL' });
            }

            await sock.sendMessage(from, { text: '⏳ Processing...' });

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/igdl?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon && res.data.respon.length > 0) {
                    const media = res.data.respon[0];
                    
                    if (media.type === 'video') {
                        await sock.sendMessage(from, {
                            video: { url: media.url },
                            caption: '📸 Instagram Video'
                        });
                    } else {
                        await sock.sendMessage(from, {
                            image: { url: media.url },
                            caption: '📷 Instagram Photo'
                        });
                    }
                } else {
                    throw new Error('No media found');
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Failed to download' });
            }
        }
    },

    igstory: {
        name: 'igstory',
        aliases: ['igs'],
        description: 'Download Instagram story',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .igstory <username>' 
                });
            }

            const username = args[0].replace('@', '');
            await sock.sendMessage(from, { text: `🔍 Fetching stories from @${username}...` });

            try {
                // Implementation butuh API khusus story
                await sock.sendMessage(from, { text: '📖 (Story download - implementasi detail)' });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    }
};

module.exports = { commands };