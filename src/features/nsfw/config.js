// ============================================
// NSFW: CONFIGURATION
// ============================================

module.exports = {
    enabled: true,
    
    // API Endpoints (free tier)
    apis: {
        waifu: 'https://api.waifu.im/search/?is_nsfw=true',
        nekos: 'https://nekos.life/api/v2/img/',
        rule34: 'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=',
        danbooru: 'https://danbooru.donmai.us/posts.json?tags='
    },

    // Categories
    categories: {
        images: ['waifu', 'neko', 'trap', 'blowjob', 'hentai'],
        videos: ['xvideos', 'xnxx'],
        gifs: ['boobs', 'ass', 'pussy', 'cum']
    },

    // Cooldown dalam ms
    cooldown: 5000,

    // Allowed in groups (false = DM only)
    allowInGroups: false
};