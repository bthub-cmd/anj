// ============================================
// UTILS: OCR (TEXT RECOGNITION)
// ============================================

const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const commands = {
    ocr: {
        name: 'ocr',
        aliases: ['read', 'totext'],
        description: 'Extract text dari gambar',
        execute: async ({ sock, from, msg }) => {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted || !quoted.imageMessage) {
                return await sock.sendMessage(from, { text: '⚠️ Reply gambar!' });
            }

            await sock.sendMessage(from, { text: '🔍 Reading text...' });

            try {
                const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Using OCR.space API (free tier)
                const form = new FormData();
                form.append('apikey', 'K88989508888957'); // Public demo key
                form.append('language', 'eng');
                form.append('isOverlayRequired', 'false');
                form.append('filetype', 'png');
                form.append('base64Image', `data:image/png;base64,${buffer.toString('base64')}`);

                const res = await axios.post('https://api.ocr.space/parse/image', form, {
                    headers: form.getHeaders()
                });

                if (res.data.ParsedResults && res.data.ParsedResults[0]) {
                    const text = res.data.ParsedResults[0].ParsedText;
                    await sock.sendMessage(from, { 
                        text: `📝 *Hasil OCR:*\n\n${text || 'Tidak ada text terdeteksi.'}` 
                    });
                } else {
                    throw new Error('OCR failed');
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Gagal membaca text.' });
            }
        }
    }
};

module.exports = { commands };