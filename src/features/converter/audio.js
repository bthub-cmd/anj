// ============================================
// CONVERTER: AUDIO EFFECTS
// ============================================

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@adiwajshing/baileys');

const commands = {
    tomp3: {
        name: 'tomp3',
        aliases: ['mp3', 'audio'],
        description: 'Convert video ke MP3',
        execute: async ({ sock, from, msg }) => {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted || !quoted.videoMessage) {
                return await sock.sendMessage(from, { text: '⚠️ Reply video!' });
            }

            await sock.sendMessage(from, { text: '⏳ Converting to MP3...' });

            try {
                const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const tmpVideo = `./tmp/${Date.now()}.mp4`;
                const tmpAudio = tmpVideo.replace('.mp4', '.mp3');
                
                fs.writeFileSync(tmpVideo, buffer);

                exec(`ffmpeg -i "${tmpVideo}" -vn -ar 44100 -ac 2 -b:a 192k "${tmpAudio}"`, async (err) => {
                    fs.unlinkSync(tmpVideo);
                    
                    if (err) {
                        return await sock.sendMessage(from, { text: '❌ Conversion failed.' });
                    }

                    await sock.sendMessage(from, {
                        audio: fs.readFileSync(tmpAudio),
                        mimetype: 'audio/mpeg'
                    });

                    fs.unlinkSync(tmpAudio);
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error.' });
            }
        }
    },

    bass: {
        name: 'bass',
        description: 'Tambah efek bass',
        execute: async ({ sock, from, msg, args }) => {
            const level = args[0] || '10';
            await processAudio(sock, from, msg, `bass=g=${level}`);
        }
    },

    nightcore: {
        name: 'nightcore',
        description: 'Efek nightcore (speed up)',
        execute: async ({ sock, from, msg }) => {
            await processAudio(sock, from, msg, 'asetrate=48000*1.25,aresample=48000');
        }
    },

    slow: {
        name: 'slow',
        aliases: ['slowed', 'slowreverb'],
        description: 'Slow + reverb effect',
        execute: async ({ sock, from, msg }) => {
            await processAudio(sock, from, msg, 'asetrate=48000*0.8,aresample=48000');
        }
    },

    robot: {
        name: 'robot',
        description: 'Efek suara robot',
        execute: async ({ sock, from, msg }) => {
            await processAudio(sock, from, msg, 'afftfilt=real=\'hypot(re,im)*cos((random(0)*2-1)*2*3.14)\':imag=\'hypot(re,im)*sin((random(1)*2-1)*2*3.14)\':win_size=512:overlap=0.75');
        }
    },

    reverse: {
        name: 'reverse',
        description: 'Putar audio terbalik',
        execute: async ({ sock, from, msg }) => {
            await processAudio(sock, from, msg, 'areverse');
        }
    }
};

async function processAudio(sock, from, msg, filter) {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
        return await sock.sendMessage(from, { text: '⚠️ Reply audio/video!' });
    }

    await sock.sendMessage(from, { text: '⏳ Processing audio...' });

    try {
        const type = quoted.audioMessage ? 'audio' : 'video';
        const stream = await downloadContentFromMessage(quoted[`${type}Message`], type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tmpIn = `./tmp/${Date.now()}_in.mp3`;
        const tmpOut = `./tmp/${Date.now()}_out.mp3`;
        
        fs.writeFileSync(tmpIn, buffer);

        exec(`ffmpeg -i "${tmpIn}" -af "${filter}" "${tmpOut}"`, async (err) => {
            fs.unlinkSync(tmpIn);
            
            if (err) {
                console.error(err);
                return await sock.sendMessage(from, { text: '❌ Processing failed.' });
            }

            await sock.sendMessage(from, {
                audio: fs.readFileSync(tmpOut),
                mimetype: 'audio/mpeg',
                ptt: false
            });

            fs.unlinkSync(tmpOut);
        });
    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Error processing.' });
    }
}

module.exports = { commands };