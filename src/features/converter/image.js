// ============================================
// CONVERTER: IMAGE EDITOR
// ============================================

const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const Jimp = require('jimp');
const fs = require('fs');

const commands = {
    blur: {
        name: 'blur',
        description: 'Blur gambar',
        execute: async ({ sock, from, msg, args }) => {
            const radius = parseInt(args[0]) || 5;
            await processImage(sock, from, msg, (img) => img.blur(radius));
        }
    },

    greyscale: {
        name: 'greyscale',
        aliases: ['bw', 'blackwhite'],
        description: 'Hitam putih',
        execute: async ({ sock, from, msg }) => {
            await processImage(sock, from, msg, (img) => img.greyscale());
        }
    },

    sepia: {
        name: 'sepia',
        description: 'Efek sepia',
        execute: async ({ sock, from, msg }) => {
            await processImage(sock, from, msg, (img) => img.sepia());
        }
    },

    invert: {
        name: 'invert',
        description: 'Invert warna',
        execute: async ({ sock, from, msg }) => {
            await processImage(sock, from, msg, (img) => img.invert());
        }
    },

    brightness: {
        name: 'brightness',
        description: 'Adjust brightness',
        execute: async ({ sock, from, msg, args }) => {
            const val = parseFloat(args[0]) || 0;
            await processImage(sock, from, msg, (img) => img.brightness(val));
        }
    },

    contrast: {
        name: 'contrast',
        description: 'Adjust contrast',
        execute: async ({ sock, from, msg, args }) => {
            const val = parseFloat(args[0]) || 0;
            await processImage(sock, from, msg, (img) => img.contrast(val));
        }
    },

    resize: {
        name: 'resize',
        description: 'Resize gambar',
        execute: async ({ sock, from, msg, args }) => {
            const w = parseInt(args[0]) || 512;
            const h = parseInt(args[1]) || 512;
            await processImage(sock, from, msg, (img) => img.resize(w, h));
        }
    },

    flip: {
        name: 'flip',
        description: 'Flip horizontal',
        execute: async ({ sock, from, msg }) => {
            await processImage(sock, from, msg, (img) => img.flip(true, false));
        }
    },

    rotate: {
        name: 'rotate',
        description: 'Rotate gambar',
        execute: async ({ sock, from, msg, args }) => {
            const deg = parseInt(args[0]) || 90;
            await processImage(sock, from, msg, (img) => img.rotate(deg));
        }
    },

    circle: {
        name: 'circle',
        description: 'Crop jadi lingkaran',
        execute: async ({ sock, from, msg }) => {
            await processImage(sock, from, msg, async (img) => {
                img.circle();
                return img;
            });
        }
    }
};

async function processImage(sock, from, msg, processFn) {
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted || !quoted.imageMessage) {
        return await sock.sendMessage(from, { text: '⚠️ Reply gambar!' });
    }

    await sock.sendMessage(from, { text: '⏳ Processing...' });

    try {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const image = await Jimp.read(buffer);
        await processFn(image);
        
        const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        
        await sock.sendMessage(from, { 
            image: processedBuffer,
            caption: '✅ Done!'
        });
    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Error processing image.' });
    }
}

module.exports = { commands };