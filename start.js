// ============================================
// MARIN BOT - ENTRY POINT
// ============================================
// File ini adalah entry point utama bot
// Wajib diisi pertama kali

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check apakah semua file core sudah diisi
const requiredFiles = [
    './src/core/connection.js',
    './src/core/setup-wizard.js',
    './src/core/handler.js',
    './src/core/command-loader.js',
    './src/utils/logger.js',
    './src/database/json-db.js'
];

console.log('🚀 Starting Marin Bot...');
console.log('================================');

// Check file exists and not empty
let missingFiles = [];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        missingFiles.push(file);
    } else {
        const stats = fs.statSync(file);
        if (stats.size === 0) {
            missingFiles.push(file + ' (kosong)');
        }
    }
}

if (missingFiles.length > 0) {
    console.error('❌ File belum diisi:');
    missingFiles.forEach(f => console.error('   - ' + f));
    console.error('\n⚠️  Isi semua file terlebih dahulu!');
    process.exit(1);
}

// Auto-install dependencies if needed
if (!fs.existsSync('./node_modules')) {
    console.log('📦 Installing dependencies...');
    const npm = spawn('npm', ['install'], { stdio: 'inherit' });
    npm.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed');
            startBot();
        } else {
            console.error('❌ npm install failed');
            process.exit(1);
        }
    });
} else {
    startBot();
}

function startBot() {
    console.log('🤖 Loading core modules...');
    
    try {
        const Connection = require('./src/core/connection');
        const connection = new Connection();
        connection.start();
    } catch (error) {
        console.error('❌ Error starting bot:', error.message);
        process.exit(1);
    }
}