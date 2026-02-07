// ============================================
// CORE: SETUP WIZARD (KONFIGURASI VIA WHATSAPP)
// ============================================
// WAJIB: Semua field harus diisi, tidak bisa skip

class SetupWizard {
    constructor(sock, db) {
        this.sock = sock;
        this.db = db;
        this.step = 0;
        this.tempConfig = {};
        this.setupComplete = false;
        
        // 6 Langkah wajib
        this.steps = [
            { name: 'owner', question: '👤 *Step 1/6: Nomor Owner*\n\nReply dengan nomor WhatsApp owner:\nFormat: `.owner 628xxxxxxxxxx`', required: true },
            { name: 'botName', question: '🤖 *Step 2/6: Nama Bot*\n\nReply dengan nama bot:\nFormat: `.name Marin-Bot`', default: 'Marin-Bot' },
            { name: 'prefix', question: '⌨️ *Step 3/6: Prefix Command*\n\nReply dengan simbol prefix:\nFormat: `.prefix .` (atau !, #, dll)', default: '.' },
            { name: 'nsfw', question: '🔞 *Step 4/6: NSFW Mode*\n\nAktifkan fitur dewasa?\nFormat: `.nsfw on` atau `.nsfw off`', default: 'off' },
            { name: 'autoread', question: '👁️ *Step 5/6: Auto Read*\n\nBot auto-read pesan?\nFormat: `.autoread on` atau `.autoread off`', default: 'on' },
            { name: 'language', question: '🌐 *Step 6/6: Bahasa*\n\nPilih bahasa:\nFormat: `.lang id` (id/en)', default: 'id' }
        ];
    }

    async start() {
        // Tunggu sampai ada pesan dari anyone
        console.log('⏳ Waiting for first message to start setup...');
    }

    async handleMessage(m) {
        if (this.setupComplete) return;

        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';

        // Step 0: Belum mulai, tunggu trigger
        if (this.step === 0 && !this.tempConfig.started) {
            this.tempConfig.started = true;
            this.tempConfig.setupJid = from;
            await this.askCurrentStep(from);
            return;
        }

        // Hanya jawab ke jid yang mulai setup
        if (from !== this.tempConfig.setupJid) {
            await this.sock.sendMessage(from, { 
                text: '⛔ Setup sedang berlangsung di chat lain.' 
            });
            return;
        }

        // Parse command
        const match = text.match(/^\.(\w+)\s*(.*)$/);
        if (!match) {
            await this.sock.sendMessage(from, { 
                text: '❌ Format salah. Gunakan: `.command value`' 
            });
            return;
        }

        const [, cmd, value] = match;
        const currentStep = this.steps[this.step];

        // Validate command matches current step
        if (cmd !== currentStep.name && cmd !== 'set') {
            await this.sock.sendMessage(from, { 
                text: `⚠️ Step saat ini: *${currentStep.name}*\n${currentStep.question}` 
            });
            return;
        }

        // Save value
        this.tempConfig[currentStep.name] = this.processValue(currentStep.name, value);
        console.log(`✅ Step ${this.step + 1} completed: ${currentStep.name}`);

        // Next step
        this.step++;

        if (this.step >= this.steps.length) {
            await this.finishSetup(from);
        } else {
            await this.askCurrentStep(from);
        }
    }

    processValue(name, value) {
        switch(name) {
            case 'owner':
                return value.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            case 'nsfw':
            case 'autoread':
                return value.toLowerCase() === 'on';
            case 'prefix':
                return value.trim() || '.';
            default:
                return value.trim();
        }
    }

    async askCurrentStep(jid) {
        const step = this.steps[this.step];
        await this.sock.sendMessage(jid, { text: step.question });
    }

    async finishSetup(jid) {
        // Save config
        const config = {
            owner: this.tempConfig.owner,
            botName: this.tempConfig.botName,
            prefix: this.tempConfig.prefix,
            nsfw: this.tempConfig.nsfw,
            autoread: this.tempConfig.autoread,
            language: this.tempConfig.language,
            setupDate: new Date().toISOString(),
            version: '1.0.0'
        };

        this.db.saveConfig(config);

        await this.sock.sendMessage(jid, {
            text: `🎉 *Setup Selesai!*

📋 *Konfigurasi Tersimpan:*
• Owner: ${config.owner.split('@')[0]}
• Nama Bot: ${config.botName}
• Prefix: ${config.prefix}
• NSFW: ${config.nsfw ? 'ON' : 'OFF'}
• Auto-Read: ${config.autoread ? 'ON' : 'OFF'}
• Bahasa: ${config.language}

🔄 *Bot siap digunakan!*
Ketik ${config.prefix}menu untuk melihat fitur.`
        });

        console.log('✅ Setup complete! Restarting in normal mode...');
        this.setupComplete = true;

        // Hot reload: load handler
        setTimeout(() => {
            const Handler = require('./handler');
            const handler = new Handler(this.sock, this.db, config);
            // Replace handler in connection
            if (this.sock.handler) this.sock.handler = handler;
        }, 2000);
    }
}

module.exports = SetupWizard;