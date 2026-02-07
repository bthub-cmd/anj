// ============================================
// CONVERTER: STICKER MAKER
// ============================================

const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
    sticker: {
        name: 'sticker',
        aliases: ['s', 'stiker'],
        description: 'Buat sticker dari gambar/video',
        execute: async ({ sock, from, msg }) => {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const messageType = Object.keys(msg.message)[0];
            
            let mediaMsg = msg.message;
            if (quoted) {
                mediaMsg = quoted;
            }

            const isImage = mediaMsg.imageMessage;
            const isVideo = mediaMsg.videoMessage;

            if (!isImage && !isVideo) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Reply/kirim gambar/video dengan caption .sticker' 
                });
            }

            await sock.sendMessage(from, { text: '⏳ Membuat sticker...' });

            try {
                const stream = await downloadContentFromMessage(
                    isImage ? mediaMsg.imageMessage : mediaMsg.videoMessage,
                    isImage ? 'image' : 'video'
                );

                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Simpan ke file
                const tmpFile = path.join('./tmp', `sticker_${Date.now()}.${isImage ? 'png' : 'mp4'}`);
                fs.writeFileSync(tmpFile, buffer);

                // Convert ke webp (simplified, butuh ffmpeg-webp)
                const stickerFile = tmpFile.replace(/\.[^/.]+$/, '.webp');
                
                // Gunakan ffmpeg untuk convert
                const cmd = isImage 
                    ? `ffmpeg -i "${tmpFile}" -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -lossless 1 -qscale 100 "${stickerFile}"`
                    : `ffmpeg -i "${tmpFile}" -vf "fps=30,scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${stickerFile}"`;

                exec(cmd, async (error) => {
                    // Cleanup tmp file
                    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

                    if (error) {
                        console.error(error);
                        return await sock.sendMessage(from, { text: '❌ Gagal membuat sticker.' });
                    }

                    await sock.sendMessage(from, { 
                        sticker: fs.readFileSync(stickerFile) 
                    });

                    fs.unlinkSync(stickerFile);
                });

            } catch (e) {
                console.error(e);
                await sock.sendMessage(from, { text: '❌ Error processing media.' });
            }
        }
    },

    toimg: {
        name: 'toimg',
        aliases: ['img', 'toimage'],
        description: 'Convert sticker ke gambar',
        execute: async ({ sock, from, msg }) => {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted || !quoted.stickerMessage) {
                return await sock.sendMessage(from, { text: '⚠️ Reply sticker!' });
            }

            await sock.sendMessage(from, { text: '⏳ Converting...' });

            try {
                const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                await sock.sendMessage(from, { 
                    image: buffer,
                    caption: '🖼️ Converted!'
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error converting.' });
            }
        }
    },

    steal: {
        name: 'steal',
        aliases: ['take', 'colong'],
        description: 'Ambil sticker dengan nama sendiri',
        execute: async ({ sock, from, msg, args }) => {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted || !quoted.stickerMessage) {
                return await sock.sendMessage(from, { text: '⚠️ Reply sticker!' });
            }

            const pack = args.join(' ') || 'Marin Bot';
            const author = 'Created by Marin';

            try {
                const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Note: Modifikasi metadata sticker butuh library khusus
                // Ini placeholder
                await sock.sendMessage(from, { 
                    sticker: buffer,
                    contextInfo: {
                        externalAdReply: {
                            title: pack,
                            body: author
                        }
                    }
                });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Error.' });
            }
        }
    }
};

module.exports = { commands };