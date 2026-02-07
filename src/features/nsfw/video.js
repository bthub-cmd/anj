// ============================================
// NSFW: VIDEO COMMANDS
// ============================================

const axios = require('axios');
const cheerio = require('cheerio');

const commands = {
    xvideos: {
        name: 'xvideos',
        aliases: ['xv'],
        description: 'Search Xvideos',
        execute: async ({ sock, from, args, config: botConfig }) => {
            if (!botConfig.nsfw) {
                return await sock.sendMessage(from, { 
                    text: '🔞 NSFW dinonaktifkan.' 
                });
            }

            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .xvideos <query>' 
                });
            }

            const query = args.join(' ');
            await sock.sendMessage(from, { text: `🔍 Searching: ${query}...` });

            try {
                // Note: Ini placeholder, actual implementation butuh scraper
                await sock.sendMessage(from, { 
                    text: `🔞 Hasil pencarian "${query}":\n\n(Dummy result - implementasi nyata butuh scraper khusus)` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error searching' });
            }
        }
    },

    xnxx: {
        name: 'xnxx',
        description: 'Search XNXX',
        execute: async ({ sock, from, args, config: botConfig }) => {
            if (!botConfig.nsfw) return;
            
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .xnxx <query>' 
                });
            }

            const query = args.join(' ');
            await sock.sendMessage(from, { text: `🔍 Searching: ${query}...` });

            try {
                await sock.sendMessage(from, { 
                    text: `🔞 Hasil pencarian "${query}":\n\n(Dummy result)` 
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error' });
            }
        }
    }
};

module.exports = { commands };