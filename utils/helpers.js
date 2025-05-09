function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>'"]/g, 
        match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[match]));
}

module.exports = { escapeHtml };