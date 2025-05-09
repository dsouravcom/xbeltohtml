const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storageConfig = require('../config/storage');

class FileModel {
    static generateUniqueFilename(originalName) {
        const ext = path.extname(originalName);
        return `${uuidv4()}${ext}`;
    }

    static saveUploadedFile(buffer, filename) {
        const filePath = path.join(storageConfig.uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        return filename;
    }

    static saveConvertedFile(content, filename) {
        const convertedFilename = `${path.parse(filename).name}_converted.html`;
        const filePath = path.join(storageConfig.convertedDir, convertedFilename);
        fs.writeFileSync(filePath, content);
        return convertedFilename;
    }

    static deleteFile(filename, type = 'uploaded') {
        const dir = type === 'uploaded' ? storageConfig.uploadDir : storageConfig.convertedDir;
        const filePath = path.join(dir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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