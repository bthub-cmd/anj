// ============================================
// CORE: COMMAND LOADER (AUTO-LOAD MODULES)
// ============================================

const fs = require('fs');
const path = require('path');

class CommandLoader {
    constructor() {
        this.commands = new Map();
        this.featuresDir = path.join(__dirname, '../features');
    }

    load() {
        // Scan semua folder di features/
        const categories = fs.readdirSync(this.featuresDir);
        
        for (const category of categories) {
            const categoryPath = path.join(this.featuresDir, category);
            
            // Skip jika bukan folder
            if (!fs.statSync(categoryPath).isDirectory()) continue;
            
            // Scan file .js di folder
            const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
            
            for (const file of files) {
                const filePath = path.join(categoryPath, file);
                
                // Check file size (skip jika kosong)
                const stats = fs.statSync(filePath);
                if (stats.size === 0) {
                    console.log(`⚠️  Skipping empty file: ${category}/${file}`);
                    continue;
                }

                try {
                    // Delete cache untuk hot-reload
                    delete require.cache[require.resolve(filePath)];
                    
                    const module = require(filePath);
                    
                    // Register commands
                    if (module.commands) {
                        for (const [name, cmd] of Object.entries(module.commands)) {
                            this.commands.set(name, cmd);
                            
                            // Register aliases
                            if (cmd.aliases) {
                                for (const alias of cmd.aliases) {
                                    this.commands.set(alias, cmd);
                                }
                            }
                        }
                    }
                    
                    console.log(`✅ Loaded: ${category}/${file}`);
                } catch (error) {
                    console.error(`❌ Failed to load ${category}/${file}:`, error.message);
                }
            }
        }

        return this.commands;
    }
}

module.exports = CommandLoader;