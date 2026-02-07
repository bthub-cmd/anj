// ============================================
// CONVERTER: MEDIA TOOLS
// ============================================

const { exec } = require('child_process');
const fs = require('fs');
const { downloadContentFromMessage } = require('@adiwajshing/baileys');

const commands = {
    cut: {
        name: 'cut',
        aliases: ['trim'],
        description: 'Potong video/audio',
        execute: async ({ sock, from, msg, args }) => {
            if (args.length < 2) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage: .cut <start> <duration>\nContoh: .cut 00:00:10 5' 
                });
            }

            const start = args[0];
            const duration = args[1];
            
            await processMedia(sock, from, msg, (input, output) => 
                `ffmpeg -i "${input}" -ss ${start} -t ${duration} -c copy "${output}"`
            );
        }
    },

    merge: {
        name: 'merge',
        description: 'Gabungkan audio + video',
        execute: async ({ sock, from }) => {
            // Butuh 2 reply (video dan audio)
            await sock.sendMessage(from, { text: '⏳ (Fitur merge - butuh implementasi khusus)' });
        }
    },

    volume: {
        name: 'volume',
        description: 'Adjust volume',
        execute: async ({ sock, from, msg, args }) => {
            const vol = args[0] || '1.5';
            await processMedia(sock, from, msg, (input, output) => 
                `ffmpeg -i "${input}" -af "volume=${vol}" "${output}"`
            );
        }
    },

    speed: {
        name: 'speed',
        description: 'Adjust speed',
        execute: async ({ sock, from, msg, args }) => {
            const speed = args[0] || '1.5';
            await processMedia(sock, from, msg, (input, output) => 
                `ffmpeg -i "${input}" -filter_complex "[0:v]setpts=${1/speed}*PTS[v];[0:a]atempo=${speed}[a]" -map "[v]" -map "[a]" "${output}"`
            );
        }
    },

    removebg: {
        name: 'removebg',
        aliases: ['nobg'],
        description: 'Hapus background gambar',
        execute: async ({ sock, from, msg }) => {
            // Butuh API remove.bg atau model ML lokal
            await sock.sendMessage(from, { text: '⏳ (Butuh API remove.bg)' });
        }
    },

    tohd: {
        name: 'tohd',
        aliases: ['remini', 'enhance'],
        description: 'Enhance gambar ke HD',
        execute: async ({ sock, from, msg }) => {
            await sock.sendMessage(from, { text: '⏳ (Butuh API AI enhance)' });
        }
    }
};

async function processMedia(sock, from, msg, getCommand) {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
        return await sock.sendMessage(from, { text: '⚠️ Reply media!' });
    }

    const type = quoted.videoMessage ? 'video' : 
                 quoted.audioMessage ? 'audio' : null;
    
    if (!type) {
        return await sock.sendMessage(from, { text: '⚠️ Reply video/audio!' });
    }

    await sock.sendMessage(from, { text: '⏳ Processing...' });

    try {
        const stream = await downloadContentFromMessage(quoted[`${type}Message`], type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const ext = type === 'video' ? 'mp4' : 'mp3';
        const tmpIn = `./tmp/${Date.now()}_in.${ext}`;
        const tmpOut = `./tmp/${Date.now()}_out.${ext}`;
        
        fs.writeFileSync(tmpIn, buffer);

        const cmd = getCommand(tmpIn, tmpOut);

        exec(cmd, async (err) => {
            fs.unlinkSync(tmpIn);
            
            if (err) {
                return await sock.sendMessage(from, { text: '❌ Processing failed.' });
            }

            if (type === 'video') {
                await sock.sendMessage(from, { video: fs.readFileSync(tmpOut) });
            } else {
                await sock.sendMessage(from, { 
                    audio: fs.readFileSync(tmpOut),
                    mimetype: 'audio/mpeg'
                });
            }

            fs.unlinkSync(tmpOut);
        });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error.' });
    }
}

module.exports = { commands };