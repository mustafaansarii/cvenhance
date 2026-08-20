import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export async function textFromFile(file) {
    if (/\.docx$/i.test(file.name)) {
        return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) =>
            (await (await pdf.getPage(i + 1)).getTextContent()).items.map((x) => x.str).join(' ')),
    );
    return pages.join('\n\n');
}
