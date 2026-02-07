// ============================================
// UTILS: SCREENSHOT WEBSITE
// ============================================

const axios = require('axios');

const commands = {
    ss: {
        name: 'ss',
        aliases: ['ssweb', 'screenshot'],
        description: 'Screenshot website',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .ss <url>' });
            }

            let url = args[0];
            if (!url.startsWith('http')) url = 'https://' + url;

            await sock.sendMessage(from, { text: '📸 Taking screenshot...' });

            try {
                // Using screenshot API (free tier)
                const apiUrl = `https://api.akuari.my.id/other/ssweb?link=${encodeURIComponent(url)}`;
                const res = await axios.get(apiUrl);
                
                if (res.data.respon) {
                    await sock.sendMessage(from, { 
                        image: { url: res.data.respon },
                        caption: `📸 Screenshot of ${url}`
                    });
                } else {
                    throw new Error('No screenshot');
                }
            } catch (e) {
                // Fallback alternative API
                try {
                    const altUrl = `https://shot.screenshotapi.net/screenshot?token=DEMO_TOKEN&url=${encodeURIComponent(url)}&output=image&file_type=png&wait_for_event=load`;
                    await sock.sendMessage(from, { 
                        image: { url: altUrl },
                        caption: `📸 Screenshot of ${url}`
                    });
                } catch (altE) {
                    await sock.sendMessage(from, { text: '❌ Gagal screenshot.' });
                }
            }
        }
    },

    ssfull: {
        name: 'ssfull',
        description: 'Screenshot full page',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .ssfull <url>' });
            }

            let url = args[0];
            if (!url.startsWith('http')) url = 'https://' + url;

            await sock.sendMessage(from, { text: '📸 Taking full screenshot...' });

            try {
                const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&full_page=true`;
                await sock.sendMessage(from, { 
                    image: { url: apiUrl },
                    caption: `📸 Full screenshot of ${url}`
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal screenshot.' });
            }
        }
    }
};

module.exports = { commands };