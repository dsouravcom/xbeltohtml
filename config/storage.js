const path = require('path');
const fs = require('fs');

const storageConfig = {
    uploadDir: path.join(__dirname, '../storage/uploads'),
    convertedDir: path.join(__dirname, '../storage/converted'),
    fileLifetime: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Create directories if they don't exist
[storageConfig.uploadDir, storageConfig.convertedDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

module.exports = storageConfig;