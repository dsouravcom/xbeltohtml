const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage');
const cacheService = require('./cacheService');

class CleanupService {
    static cleanDirectory(dir, type) {
        return new Promise((resolve) => {
            fs.readdir(dir, (err, files) => {
                if (err) return resolve();

                const now = Date.now();
                let deletedCount = 0;
                let pending = files.length;

                if (pending === 0) return resolve(deletedCount);

                files.forEach(file => {
                    // Skip files that are currently being processed
                    if (cacheService.isProcessing(file)) {
                        pending--;
                        if (pending === 0) resolve(deletedCount);
                        return;
                    }

                    const filePath = path.join(dir, file);
                    fs.stat(filePath, (err, stat) => {
                        if (err || !stat) {
                            pending--;
                            if (pending === 0) resolve(deletedCount);
                            return;
                        }

                        const fileAge = now - stat.mtimeMs;
                        if (fileAge > storageConfig.fileLifetime) {
                            fs.unlink(filePath, () => {
                                cacheService.removeFromCache(file);
                                deletedCount++;
                                pending--;
                                if (pending === 0) resolve(deletedCount);
                            });
                        } else {
                            pending--;
                            if (pending === 0) resolve(deletedCount);
                        }
                    });
                });
            });
        });
    }

    static async cleanOldFiles() {
        try {
            const uploadsDeleted = await this.cleanDirectory(storageConfig.uploadDir, 'uploaded');
            const convertedDeleted = await this.cleanDirectory(storageConfig.convertedDir, 'converted');
            
            if (uploadsDeleted > 0 || convertedDeleted > 0) {
                console.log(`Cleanup: Removed ${uploadsDeleted} uploaded and ${convertedDeleted} converted files`);
            }
            return { uploadsDeleted, convertedDeleted };
        } catch (error) {
            console.error('Cleanup error:', error);
            return { error: error.message };
        }
    }
}

module.exports = CleanupService;