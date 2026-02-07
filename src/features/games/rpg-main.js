// ============================================
// GAMES: RPG MAIN SYSTEM
// ============================================

const Helper = require('../../utils/helper');

const commands = {
    profile: {
        name: 'profile',
        aliases: ['profil', 'me'],
        description: 'Lihat profil RPG',
        execute: async ({ sock, from, sender, db }) => {
            let user = db.getUser(sender);
            
            if (!user) {
                // Initialize new user
                user = {
                    jid: sender,
                    level: 1,
                    exp: 0,
                    money: 100,
                    health: 100,
                    stamina: 100,
                    inventory: [],
                    pets: [],
                    createdAt: new Date().toISOString()
                };
                db.saveUser(sender, user);
            }

            const text = `👤 *PROFIL RPG*

🎚️ Level: ${user.level}
⭐ EXP: ${user.exp}/${user.level * 100}
💰 Money: $${user.money}
❤️ Health: ${user.health}/100
⚡ Stamina: ${user.stamina}/100
🎒 Inventory: ${user.inventory.length} items
🐾 Pets: ${user.pets.length}

📅 Joined: ${user.createdAt.split('T')[0]}`;

            await sock.sendMessage(from, { text });
        }
    },

    inventory: {
        name: 'inventory',
        aliases: ['inv', 'backpack'],
        description: 'Lihat inventory',
        execute: async ({ sock, from, sender, db }) => {
            const user = db.getUser(sender);
            if (!user || !user.inventory.length) {
                return await sock.sendMessage(from, { text: '🎒 Inventory kosong!' });
            }

            let text = `🎒 *INVENTORY*\n\n`;
            user.inventory.forEach((item, i) => {
                text += `${i + 1}. ${item.name} (${item.quantity}x) - $${item.value}\n`;
            });

            await sock.sendMessage(from, { text });
        }
    },

    daily: {
        name: 'daily',
        aliases: ['claim'],
        description: 'Klaim hadiah harian',
        cooldown: 86400000, // 24 jam
        execute: async ({ sock, from, sender, db }) => {
            const user = db.getUser(sender) || {};
            
            const now = Date.now();
            const lastClaim = user.lastDaily || 0;
            
            if (now - lastClaim < 86400000) {
                const remaining = Math.ceil((86400000 - (now - lastClaim)) / 3600000);
                return await sock.sendMessage(from, { 
                    text: `⏳ Sudah klaim hari ini!\n🕐 Tunggu ${remaining} jam lagi.` 
                });
            }

            const reward = 500 + Math.floor(Math.random() * 500);
            user.money = (user.money || 0) + reward;
            user.lastDaily = now;
            
            db.saveUser(sender, user);
            
            await sock.sendMessage(from, { 
                text: `🎁 *DAILY REWARD*\n\n💰 Kamu mendapatkan $${reward}!\n💵 Total money: $${user.money}` 
            });
        }
    },

    work: {
        name: 'work',
        aliases: ['kerja'],
        description: 'Bekerja untuk mendapatkan uang',
        cooldown: 3600000, // 1 jam
        execute: async ({ sock, from, sender, db }) => {
            const jobs = [
                { name: 'Programmer', min: 100, max: 300 },
                { name: 'Designer', min: 80, max: 250 },
                { name: 'Writer', min: 60, max: 200 },
                { name: 'Driver', min: 50, max: 150 },
                { name: 'Streamer', min: 70, max: 280 }
            ];

            const job = Helper.pickRandom(jobs);
            const earn = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

            const user = db.getUser(sender) || {};
            user.money = (user.money || 0) + earn;
            db.saveUser(sender, user);

            await sock.sendMessage(from, { 
                text: `💼 *WORK*\n\nKamu bekerja sebagai *${job.name}*\n💰 Gaji: $${earn}\n💵 Total: $${user.money}` 
            });
        }
    },

    mine: {
        name: 'mine',
        aliases: ['mining', 'nambang'],
        description: 'Mining resources',
        cooldown: 300000, // 5 menit
        execute: async ({ sock, from, sender, db }) => {
            const ores = [
                { name: 'Coal', chance: 0.4, value: 10 },
                { name: 'Iron', chance: 0.3, value: 25 },
                { name: 'Gold', chance: 0.2, value: 50 },
                { name: 'Diamond', chance: 0.08, value: 100 },
                { name: 'Emerald', chance: 0.02, value: 200 }
            ];

            const found = [];
            let totalValue = 0;

            // Roll 3 times
            for (let i = 0; i < 3; i++) {
                const roll = Math.random();
                let cumulative = 0;
                
                for (const ore of ores) {
                    cumulative += ore.chance;
                    if (roll <= cumulative) {
                        found.push(ore.name);
                        totalValue += ore.value;
                        break;
                    }
                }
            }

            if (found.length === 0) {
                return await sock.sendMessage(from, { text: '⛏️ Mining gagal, tidak menemukan apa-apa.' });
            }

            const user = db.getUser(sender) || {};
            user.money = (user.money || 0) + totalValue;
            
            // Add to inventory
            user.inventory = user.inventory || [];
            found.forEach(item => {
                const existing = user.inventory.find(i => i.name === item);
                if (existing) {
                    existing.quantity++;
                } else {
                    user.inventory.push({ name: item, quantity: 1, value: ores.find(o => o.name === item).value });
                }
            });

            db.saveUser(sender, user);

            await sock.sendMessage(from, { 
                text: `⛏️ *MINING RESULT*\n\n🪨 Found: ${found.join(', ')}\n💰 Value: $${totalValue}\n💵 Total Money: $${user.money}` 
            });
        }
    },

    fish: {
        name: 'fish',
        aliases: ['fishing', 'memancing'],
        description: 'Memancing ikan',
        cooldown: 300000,
        execute: async ({ sock, from, sender, db }) => {
            const fishes = [
                { name: 'Lele', chance: 0.5, value: 5 },
                { name: 'Nila', chance: 0.3, value: 15 },
                { name: 'Gurame', chance: 0.15, value: 30 },
                { name: 'Arwana', chance: 0.04, value: 80 },
                { name: 'Hiu', chance: 0.01, value: 150 }
            ];

            const roll = Math.random();
            let cumulative = 0;
            let caught = null;

            for (const fish of fishes) {
                cumulative += fish.chance;
                if (roll <= cumulative) {
                    caught = fish;
                    break;
                }
            }

            if (!caught) {
                return await sock.sendMessage(from, { text: '🎣 Ikan tidak menggigit.' });
            }

            const user = db.getUser(sender) || {};
            user.money = (user.money || 0) + caught.value;
            user.inventory = user.inventory || [];
            
            const existing = user.inventory.find(i => i.name === caught.name);
            if (existing) {
                existing.quantity++;
            } else {
                user.inventory.push({ name: caught.name, quantity: 1, value: caught.value });
            }

            db.saveUser(sender, user);

            await sock.sendMessage(from, { 
                text: `🎣 *FISHING*\n\n🐟 Dapat: ${caught.name}!\n💰 Value: $${caught.value}\n💵 Total: $${user.money}` 
            });
        }
    },

    shop: {
        name: 'shop',
        aliases: ['store', 'toko'],
        description: 'Lihat item di toko',
        execute: async ({ sock, from }) => {
            const items = [
                { id: 'potion', name: 'Health Potion', price: 50, desc: 'Heal 50 HP' },
                { id: 'sword', name: 'Iron Sword', price: 200, desc: 'Weapon +10 ATK' },
                { id: 'armor', name: 'Leather Armor', price: 150, desc: 'Armor +5 DEF' },
                { id: 'pickaxe', name: 'Diamond Pickaxe', price: 500, desc: 'Mining efficiency +50%' },
                { id: 'rod', name: 'Fishing Rod', price: 100, desc: 'Better fishing chance' }
            ];

            let text = `🏪 *SHOP*\n\n`;
            items.forEach(item => {
                text += `🔹 *${item.name}* - $${item.price}\n`;
                text += `   ${item.desc}\n`;
                text += `   Beli: .buy ${item.id}\n\n`;
            });

            await sock.sendMessage(from, { text });
        }
    },

    buy: {
        name: 'buy',
        description: 'Beli item dari toko',
        execute: async ({ sock, from, sender, args, db }) => {
            if (!args.length) {
                return await sock.sendMessage(from, { text: '⚠️ Usage: .buy <item-id>' });
            }

            const itemId = args[0].toLowerCase();
            const items = {
                potion: { name: 'Health Potion', price: 50, effect: 'heal' },
                sword: { name: 'Iron Sword', price: 200, effect: 'atk' },
                armor: { name: 'Leather Armor', price: 150, effect: 'def' },
                pickaxe: { name: 'Diamond Pickaxe', price: 500, effect: 'mine' },
                rod: { name: 'Fishing Rod', price: 100, effect: 'fish' }
            };

            const item = items[itemId];
            if (!item) {
                return await sock.sendMessage(from, { text: '❌ Item tidak ditemukan. Lihat .shop' });
            }

            const user = db.getUser(sender) || {};
            if ((user.money || 0) < item.price) {
                return await sock.sendMessage(from, { 
                    text: `❌ Uang tidak cukup!\n💰 Butuh: $${item.price}\n💵 Kamu: $${user.money || 0}` 
                });
            }

            user.money -= item.price;
            user.inventory = user.inventory || [];
            const existing = user.inventory.find(i => i.name === item.name);
            if (existing) {
                existing.quantity++;
            } else {
                user.inventory.push({ name: item.name, quantity: 1, value: item.price });
            }

            db.saveUser(sender, user);

            await sock.sendMessage(from, { 
                text: `✅ *PURCHASE SUCCESS*\n\n🛒 ${item.name}\n💰 -$${item.price}\n💵 Sisa: $${user.money}` 
            });
        }
    },

    leaderboard: {
        name: 'leaderboard',
        aliases: ['lb', 'top', 'rank'],
        description: 'Top players',
        execute: async ({ sock, from, db }) => {
            // Note: Ini butuh method khusus di json-db untuk get all users
            // Untuk sekarang placeholder
            await sock.sendMessage(from, { 
                text: '🏆 *LEADERBOARD*\n\n(Implementasi butuh all-users query)' 
            });
        }
    }
};

module.exports = { commands };