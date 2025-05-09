const ConversionService = require('../services/conversionService');
const FileModel = require('../models/fileModel');
const CleanupService = require('../services/cleanupService');

class ConversionController {
    static async convertFile(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Process conversion
            const { originalFile, convertedFile } = await ConversionService.processConversion(
                req.file.buffer,
                req.file.originalname
            );

            // Schedule cleanup
            setTimeout(() => {
                FileModel.deleteFile(originalFile, 'uploaded');
                FileModel.deleteFile(convertedFile, 'converted');
            }, 5 * 60 * 1000); // 5 minutes

            // Return download URL
            return res.json({
                success: true,
                downloadUrl: `/download/${convertedFile}`,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            });

        } catch (error) {
            return res.status(500).json({ 
                error: 'Conversion failed',
                details: error.message 
            });
        }
    }

    static async downloadFile(req, res) {
        try {
            const fileStream = FileModel.getFileStream(req.params.filename, 'converted');
            
            if (!fileStream) {
                return res.status(404).json({ error: 'File not found or expired' });
            }

            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
            fileStream.pipe(res);

        } catch (error) {
            res.status(500).json({ error: 'Download failed' });
        }
    }
}

module.exports = ConversionController;