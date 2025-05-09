class CacheService {
    constructor() {
        this.fileCache = new Set();
        this.lockedFiles = new Set();
    }

    getAvailableFilename(originalName) {
        let counter = 1;
        let candidateName = originalName;
        
        while (this.fileCache.has(candidateName)) {
            const ext = originalName.lastIndexOf('.');
            const baseName = ext > -1 ? originalName.substring(0, ext) : originalName;
            const extension = ext > -1 ? originalName.substring(ext) : '';
            candidateName = `${baseName}_${counter}${extension}`;
            counter++;
        }
        
        this.fileCache.add(candidateName);
        this.lockedFiles.add(candidateName); // Lock during processing
        return candidateName;
    }

    releaseLock(filename) {
        this.lockedFiles.delete(filename);
    }

    removeFromCache(filename) {
        this.fileCache.delete(filename);
        this.lockedFiles.delete(filename);
    }

    isProcessing(filename) {
        return this.lockedFiles.has(filename);
    }
}

module.exports = new CacheService(); // Singleton instance