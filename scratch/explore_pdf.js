import { PDFParse } from 'pdf-parse';
console.log('PDFParse is function:', typeof PDFParse === 'function');
// Creating a dummy PDF buffer is hard, but let's just see if it throws on empty
try {
    PDFParse(Buffer.from([])).then(() => console.log('Parsed')).catch(e => console.log('Expected error:', e.message));
} catch(e) {
    console.log('Sync throw:', e.message);
}
