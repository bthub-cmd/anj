// ============================================
// CORE: COMMAND HANDLER
// ============================================

const fs = require('fs');
const path = require('path');
const CommandLoader = require('./command-loader');

class Handler {
    constructor(sock, db, config) {
        this.sock = sock;
        this.db = db;
        this.config = config;
        this.commands = new Map();
        this.aliases = new Map();
        
        this.loadCommands();
    }

    loadCommands() {
        const loader = new CommandLoader();
        this.commands = loader.load();
        
        console.log(`📚 Loaded ${this.commands.size} commands`);
    }

    async handleMessage(m) {
        const msg = m.messages[0];
        if (!msg.message) return;

        // Auto-read jika diaktifkan
        if (this.config.autoread) {
            await this.sock.readMessages([msg.key]);
        }

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = msg.key.participant || from;
        
        // Extract text
        let text = '';
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage?.caption) {
            text = msg.message.imageMessage.caption;
        } else if (msg.message.videoMessage?.caption) {
            text = msg.message.videoMessage.caption;
        }

        // Check prefix
        const prefix = this.config.prefix;
        if (!text.startsWith(prefix)) return;

        // Parse command
        const args = text.slice(prefix.length).trim().split(/\s+/);
        const cmd = args.shift().toLowerCase();

        // Find command
        const command = this.commands.get(cmd) || this.aliases.get(cmd);
        if (!command) return;

        // Check owner only
        if (command.ownerOnly && sender !== this.config.owner) {
            return await this.sock.sendMessage(from, { 
                text: '⛔ Command ini hanya untuk owner.' 
            });
        }

        // Check group only
        if (command.groupOnly && !isGroup) {
            return await this.sock.sendMessage(from, { 
                text: '⛔ Command ini hanya untuk grup.' 
            });
        }

        // Execute command
        try {
            const context = {
                sock: this.sock,
                db: this.db,
                config: this.config,
                from,
                sender,
                isGroup,
                args,
                msg,
                text
            };

            await command.execute(context);
        } catch (error) {
            console.error(`❌ Error in command ${cmd}:`, error);
            await this.sock.sendMessage(from, { 
                text: '❌ Terjadi kesalahan saat menjalankan command.' 
            });
        }
    }
}

module.exports = Handler;