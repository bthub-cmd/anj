// ============================================
// UTILS: FILE UPLOADER (CATBOX, ETC)
// ============================================

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class Uploader {
    constructor() {
        this.catboxUrl = 'https://litterbox.catbox.moe/resources/internals/api.php';
    }

    async uploadToCatbox(filePath) {
        try {
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('time', '72h'); // 72 hours
            form.append('fileToUpload', fs.createReadStream(filePath));

            const response = await axios.post(this.catboxUrl, form, {
                headers: form.getHeaders()
            });

            return response.data;
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    async uploadBuffer(buffer, filename) {
        const tempPath = `./tmp/${filename}`;
        fs.writeFileSync(tempPath, buffer);
        
        try {
            const url = await this.uploadToCatbox(tempPath);
            fs.unlinkSync(tempPath);
            return url;
        } catch (error) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            throw error;
        }
    }
}

module.exports = Uploader;