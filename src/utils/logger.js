// ============================================
// UTILS: LOGGER
// ============================================

const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = './data/logs';
        this.ensureDir();
    }

    ensureDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        // Console
        console.log(logEntry.trim());
        
        // File
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `${date}.log`);
        fs.appendFileSync(logFile, logEntry);
    }

    info(message) {
        this.log('INFO', message);
    }

    error(message) {
        this.log('ERROR', message);
    }

    warn(message) {
        this.log('WARN', message);
    }

    debug(message) {
        this.log('DEBUG', message);
    }
}

module.exports = Logger;