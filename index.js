const express = require('express');
const cors = require('cors');
const conversionRoutes = require('./routes/conversionRoutes');
const CleanupService = require('./services/cleanupService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', conversionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start cleanup interval (runs every minute)
setInterval(() => {
    CleanupService.cleanOldFiles();
}, 60 * 1000);

// Start server
app.listen(port, () => {
    console.log(`XBEL Converter API running on port ${port}`);
});