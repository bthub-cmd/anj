// ============================================
// UTILS: HELPER FUNCTIONS
// ============================================

const moment = require('moment-timezone');

const Helper = {
    // Format nomor WhatsApp
    formatNumber(num) {
        return num.replace(/[^0-9]/g, '');
    },

    // Format bytes ke human readable
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // Format durasi
    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Get time in timezone
    getTime(timezone = 'Asia/Jakarta') {
        return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
    },

    // Delay promise
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Random picker
    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Capitalize string
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Check is URL
    isUrl(text) {
        return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
    },

    // Generate ID
    generateId(length = 8) {
        return Math.random().toString(36).substring(2, length + 2);
    }
};

module.exports = Helper;