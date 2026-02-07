// ============================================
// DOWNLOAD: YOUTUBE
// ============================================

const ytdl = require('ytdl-core');
const yts = require('yt-search');

const commands = {
    ytmp4: {
        name: 'ytmp4',
        aliases: ['ytv', 'ytvideo'],
        description: 'Download YouTube video',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .ytmp4 <url/query>' 
                });
            }

            const input = args.join(' ');
            let url = input;

            // Jika bukan URL, search dulu
            if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
                await sock.sendMessage(from, { text: '🔍 Searching...' });
                const search = await yts(input);
                if (!search.videos.length) {
                    return await sock.sendMessage(from, { text: '❌ Video not found' });
                }
                url = search.videos[0].url;
            }

            try {
                await sock.sendMessage(from, { text: '⏳ Downloading video...' });
                
                const info = await ytdl.getInfo(url);
                const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p
                
                // Download dan kirim
                const stream = ytdl(url, { format });
                
                // Note: Untuk file besar, butuh download ke file dulu
                // Ini simplified version
                await sock.sendMessage(from, {
                    video: { url: format.url },
                    caption: `🎬 ${info.videoDetails.title}\n📺 ${info.videoDetails.author.name}`
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error: ' + e.message });
            }
        }
    },

    ytmp3: {
        name: 'ytmp3',
        aliases: ['yta', 'ytaudio'],
        description: 'Download YouTube audio',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .ytmp3 <url/query>' 
                });
            }

            const input = args.join(' ');
            let url = input;

            if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
                await sock.sendMessage(from, { text: '🔍 Searching...' });
                const search = await yts(input);
                if (!search.videos.length) {
                    return await sock.sendMessage(from, { text: '❌ Not found' });
                }
                url = search.videos[0].url;
            }

            try {
                await sock.sendMessage(from, { text: '⏳ Downloading audio...' });
                
                const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
                
                await sock.sendMessage(from, {
                    audio: { stream },
                    mimetype: 'audio/mp4',
                    caption: '🎵 YouTube Audio'
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error: ' + e.message });
            }
        }
    },

    yts: {
        name: 'yts',
        aliases: ['ytsearch', 'youtube'],
        description: 'Search YouTube',
        execute: async ({ sock, from, args }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .yts <query>' 
                });
            }

            const query = args.join(' ');
            await sock.sendMessage(from, { text: `🔍 Searching: ${query}...` });

            try {
                const search = await yts(query);
                const videos = search.videos.slice(0, 5);
                
                let text = `🔎 *YouTube Search: ${query}*\n\n`;
                videos.forEach((v, i) => {
                    text += `${i + 1}. *${v.title}*\n`;
                    text += `   👤 ${v.author.name} | ⏱️ ${v.timestamp}\n`;
                    text += `   🔗 ${v.url}\n\n`;
                });

                await sock.sendMessage(from, { text });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error searching' });
            }
        }
    }
};

module.exports = { commands };