const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage');
const cacheService = require('../services/cacheService');

class FileModel {
    static saveUploadedFile(buffer, originalName) {
        const filename = cacheService.getAvailableFilename(originalName);
        const filePath = path.join(storageConfig.uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        cacheService.releaseLock(filename);
        return filename;
    }

    static saveConvertedFile(content, originalName) {
        const baseName = path.parse(originalName).name;
        const convertedFilename = `${baseName}_converted.html`;
        const finalName = cacheService.getAvailableFilename(convertedFilename);
        const filePath = path.join(storageConfig.convertedDir, finalName);
        fs.writeFileSync(filePath, content);
        cacheService.releaseLock(finalName);
        return finalName;
    }

    static deleteFile(filename, type = 'uploaded') {
        const dir = type === 'uploaded' ? storageConfig.uploadDir : storageConfig.convertedDir;
        const filePath = path.join(dir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            cacheService.removeFromCache(filename);
            return true;
        }
        return false;
    }

    static getFileStream(filename, type = 'converted') {
        const dir = type === 'uploaded' ? storageConfig.uploadDir : storageConfig.convertedDir;
        const filePath = path.join(dir, filename);
        
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath);
        }
        return null;
    }
}

module.exports = FileModel;