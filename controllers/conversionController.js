const path = require("path");
const ConversionService = require("../services/conversionService");
const FileModel = require("../models/fileModel");
const CleanupService = require("../services/cleanupService");
const CacheService = require("../services/cacheService");

class ConversionController {
  static async convertFile(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let originalFile, convertedFile;

    try {
      // Process conversion
      const result = await ConversionService.processConversion(
        req.file.buffer,
        req.file.originalname
      );

      originalFile = result.originalFile;
      convertedFile = result.convertedFile;

      // Schedule cleanup for both files
      const cleanup = () => {
        FileModel.deleteFile(originalFile, "uploaded");
        FileModel.deleteFile(convertedFile, "converted");
        CleanupService.cleanOldFiles(); // Immediate cleanup check
      };

      // Set 5 minute timeout for cleanup
      setTimeout(cleanup, 5 * 60 * 1000);

      // Also register immediate cleanup in case server shuts down
      process.on("beforeExit", cleanup);
      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);

      return res.json({
        success: true,
        downloadUrl: `${process.env.SERVER_URL}/api/download/${convertedFile}`,
        filename: `${result.originalName}_converted.html`,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      // Clean up any partial files if error occurred
      if (originalFile) FileModel.deleteFile(originalFile, "uploaded");
      if (convertedFile) FileModel.deleteFile(convertedFile, "converted");
      CleanupService.cleanOldFiles();

      return res.status(500).json({
        error: "Conversion failed",
        details: error.message,
      });
    }
  }

  static async downloadFile(req, res) {
    try {
      const filename = req.params.filename;

      // Check if file exists and isn't being processed
      if (CacheService.isProcessing(filename)) {
        return res
          .status(423)
          .json({ error: "File is currently being processed" });
      }

      const fileStream = FileModel.getFileStream(filename, "converted");

      if (!fileStream) {
        return res.status(404).json({ error: "File not found or expired" });
      }

      // Suggest original filename in download
      const downloadFilename = filename.includes("_converted.html")
        ? filename
        : `${path.parse(filename).name}_converted.html`;

      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadFilename}"`
      );
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  }
}

module.exports = ConversionController;
