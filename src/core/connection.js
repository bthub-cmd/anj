// ============================================
// CORE: WHATSAPP CONNECTION (BAILEYS)
// ============================================

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion 
} = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const SetupWizard = require('./setup-wizard');
const Handler = require('./handler');
const Database = require('../database/json-db');
const Logger = require('../utils/logger');

class Connection {
    constructor() {
        this.sock = null;
        this.db = new Database();
        this.logger = new Logger();
        this.handler = null;
        this.wizard = null;
        this.isSetupMode = false;
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('./data/session');
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            auth: state,
            browser: ['Marin Bot', 'Chrome', '1.0.0']
        });

        // Event: Connection Update
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('📱 Scan QR code di atas dengan WhatsApp');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                    lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;
                
                console.log('⚠️  Connection closed:', lastDisconnect?.error?.message);
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnecting...');
                    setTimeout(() => this.start(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ Connected to WhatsApp!');
                await this.onConnected();
            }
        });

        // Event: Credentials Update
        this.sock.ev.on('creds.update', saveCreds);

        // Event: Messages
        this.sock.ev.on('messages.upsert', async (m) => {
            if (this.isSetupMode && this.wizard) {
                await this.wizard.handleMessage(m);
            } else if (this.handler) {
                await this.handler.handleMessage(m);
            }
        });
    }

    async onConnected() {
        // Check if config exists
        const config = this.db.getConfig();
        
        if (!config || !config.owner) {
            console.log('🔧 Setup Mode: Waiting for owner configuration...');
            this.isSetupMode = true;
            this.wizard = new SetupWizard(this.sock, this.db);
            await this.wizard.start();
        } else {
            console.log(`🤖 Bot ready! Owner: ${config.owner}`);
            this.isSetupMode = false;
            this.handler = new Handler(this.sock, this.db, config);
        }
    }

    getSocket() {
        return this.sock;
    }
}

module.exports = Connection;