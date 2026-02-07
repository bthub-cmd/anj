// ============================================
// DOWNLOAD: UNIVERSAL / ALL-IN-ONE
// ============================================

const axios = require('axios');

const commands = {
    dl: {
        name: 'dl',
        aliases: ['download', 'unduh'],
        description: 'Universal downloader (auto-detect platform)',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .dl <url>\n\nSupports: YouTube, TikTok, Instagram, Facebook, Twitter, etc.' 
                });
            }

            const url = args[0];
            await sock.sendMessage(from, { text: '🔍 Detecting platform...' });

            // Auto-detect platform
            let platform = 'unknown';
            if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
            else if (url.includes('tiktok.com')) platform = 'tiktok';
            else if (url.includes('instagram.com')) platform = 'instagram';
            else if (url.includes('facebook.com') || url.includes('fb.watch')) platform = 'facebook';
            else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter';
            else if (url.includes('pinterest.com')) platform = 'pinterest';
            else if (url.includes('soundcloud.com')) platform = 'soundcloud';
            else if (url.includes('mediafire.com')) platform = 'mediafire';

            if (platform === 'unknown') {
                return await sock.sendMessage(from, { 
                    text: '❌ Platform not supported or URL invalid' 
                });
            }

            await sock.sendMessage(from, { text: `⏳ Processing ${platform}...` });

            try {
                // Try universal API
                const apiUrl = `https://api.akuari.my.id/downloader/allin?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    const media = res.data.respon;
                    
                    if (media.video || media.url) {
                        await sock.sendMessage(from, {
                            video: { url: media.video || media.url },
                            caption: `✅ Downloaded from ${platform}`
                        });
                    } else if (media.image || media.thumb) {
                        await sock.sendMessage(from, {
                            image: { url: media.image || media.thumb },
                            caption: `✅ Downloaded from ${platform}`
                        });
                    } else {
                        throw new Error('Unknown media type');
                    }
                } else {
                    throw new Error('No response from API');
                }
            } catch (e) {
                await sock.sendMessage(from, { 
                    text: `❌ Failed to download from ${platform}\nError: ${e.message}` 
                });
            }
        }
    },

    pinterest: {
        name: 'pinterest',
        aliases: ['pin'],
        description: 'Download Pinterest media',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .pinterest <url>' });
            }

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/pinterest?link=${encodeURIComponent(args[0])}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    await sock.sendMessage(from, {
                        image: { url: res.data.respon },
                        caption: '📌 Pinterest'
                    });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    },

    soundcloud: {
        name: 'soundcloud',
        aliases: ['sc'],
        description: 'Download SoundCloud audio',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .soundcloud <url>' });
            }

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/soundcloud?link=${encodeURIComponent(args[0])}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    await sock.sendMessage(from, {
                        audio: { url: res.data.respon },
                        mimetype: 'audio/mp3',
                        caption: '🎵 SoundCloud'
                    });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    },

    mediafire: {
        name: 'mediafire',
        aliases: ['mf'],
        description: 'Download MediaFire file',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .mediafire <url>' });
            }

            try {
                const apiUrl = `https://api.akuari.my.id/downloader/mediafire?link=${encodeURIComponent(args[0])}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    await sock.sendMessage(from, {
                        document: { url: res.data.respon },
                        caption: '📁 MediaFire Download'
                    });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    }
};

module.exports = { commands };