const xml2js = require('xml2js');
const FileModel = require('../models/fileModel');
const { escapeHtml } = require('../utils/helpers');

class ConversionService {
    static async convertXBELToHTML(xbelContent) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xbelContent);
        
        let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="0" LAST_MODIFIED="0" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
    <DL><p>\n`;

        // Conversion logic remains the same as before
        if (result.xbel.bookmark) {
            result.xbel.bookmark.forEach(item => {
                if (item.$ && item.$.href) {
                    const title = item.title && item.title[0] ? item.title[0] : '';
                    html += `        <DT><A HREF="${item.$.href}" ADD_DATE="0">${escapeHtml(title)}</A>\n`;
                }
            });
        }

        if (result.xbel.folder) {
            result.xbel.folder.forEach(folder => {
                if (folder.$ && folder.title && folder.title[0]) {
                    html += `        <DT><H3 ADD_DATE="0" LAST_MODIFIED="0">${escapeHtml(folder.title[0])}</H3>\n`;
                    html += `        <DL><p>\n`;
                    
                    if (folder.bookmark) {
                        folder.bookmark.forEach(bookmark => {
                            if (bookmark.$ && bookmark.$.href) {
                                const title = bookmark.title && bookmark.title[0] ? bookmark.title[0] : '';
                                html += `            <DT><A HREF="${bookmark.$.href}" ADD_DATE="0">${escapeHtml(title)}</A>\n`;
                            }
                        });
                    }
                    
                    html += `        </DL><p>\n`;
                }
            });
        }

        html += `    </DL><p>
</DL><p>`;

        return html;
    }

    static async processConversion(fileBuffer, originalFilename) {
        const xbelContent = fileBuffer.toString('utf8');
        const htmlContent = await this.convertXBELToHTML(xbelContent);
        
        const savedFilename = FileModel.saveUploadedFile(fileBuffer, originalFilename);
        const convertedFilename = FileModel.saveConvertedFile(htmlContent, originalFilename);
        
        return {
            originalFile: savedFilename,
            convertedFile: convertedFilename
        };
    }
}

module.exports = ConversionService;