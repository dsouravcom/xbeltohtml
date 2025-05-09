const express = require('express');
const multer = require('multer');
const ConversionController = require('../controllers/conversionController');
const storageConfig = require('../config/storage');

const router = express.Router();

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.post('/convert', upload.single('xbelFile'), ConversionController.convertFile);
router.get('/download/:filename', ConversionController.downloadFile);

module.exports = router;