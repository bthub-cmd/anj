// ============================================
// DATABASE: JSON-BASED STORAGE
// ============================================

const fs = require('fs');
const path = require('path');

class JsonDB {
    constructor() {
        this.basePath = './data/database';
        this.ensureDir();
        
        this.files = {
            config: 'config.json',
            users: 'users.json',
            groups: 'groups.json',
            games: 'games.json'
        };
    }

    ensureDir() {
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    read(file) {
        const filePath = path.join(this.basePath, file);
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    write(file, data) {
        const filePath = path.join(this.basePath, file);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    // Config
    getConfig() {
        return this.read(this.files.config);
    }

    saveConfig(config) {
        this.write(this.files.config, config);
    }

    // Users
    getUser(jid) {
        const users = this.read(this.files.users) || {};
        return users[jid] || null;
    }

    saveUser(jid, data) {
        const users = this.read(this.files.users) || {};
        users[jid] = { ...users[jid], ...data, updatedAt: new Date().toISOString() };
        this.write(this.files.users, users);
    }

    // Groups
    getGroup(jid) {
        const groups = this.read(this.files.groups) || {};
        return groups[jid] || null;
    }

    saveGroup(jid, data) {
        const groups = this.read(this.files.groups) || {};
        groups[jid] = { ...groups[jid], ...data, updatedAt: new Date().toISOString() };
        this.write(this.files.groups, groups);
    }

    // Games
    getGame(userId) {
        const games = this.read(this.files.games) || {};
        return games[userId] || null;
    }

    saveGame(userId, data) {
        const games = this.read(this.files.games) || {};
        games[userId] = { ...games[userId], ...data, updatedAt: new Date().toISOString() };
        this.write(this.files.games, games);
    }
}

module.exports = JsonDB;