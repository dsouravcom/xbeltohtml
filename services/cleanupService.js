const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage');

class CleanupService {
    static cleanOldFiles() {
        const now = Date.now();
        const cleanDirectory = (dir) => {
            fs.readdir(dir, (err, files) => {
                if (err) return;
                
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    fs.stat(filePath, (err, stat) => {
                        if (err) return;
                        
                        const fileAge = now - stat.mtimeMs;
                        if (fileAge > storageConfig.fileLifetime) {
                            fs.unlink(filePath, () => {});
                        }
                    });
                });
            });
        };

        cleanDirectory(storageConfig.uploadDir);
        cleanDirectory(storageConfig.convertedDir);
    }
}

module.exports = CleanupService;