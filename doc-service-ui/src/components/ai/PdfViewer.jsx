import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextLayer } from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

const highlightColors = {
    repetition: 'rgba(254, 202, 202, 0.78)',
    buzzwords: 'rgba(254, 240, 138, 0.78)',
    readability: 'rgba(191, 219, 254, 0.78)',
    growth: 'rgba(167, 243, 208, 0.78)',
};

export default function PdfViewer({ file, activePhrase, activeCategory }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!file || !containerRef.current) return undefined;

        let cancelled = false;
        const container = containerRef.current;

        async function renderPdf() {
            container.replaceChildren();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
            const outputScale = (window.devicePixelRatio || 1) * 2;

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                if (cancelled) return;
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 1.25 });
                const wrapper = document.createElement('div');
                wrapper.className = 'relative shrink-0 overflow-hidden bg-white shadow-lg';
                wrapper.style.width = `${viewport.width}px`;
                wrapper.style.height = `${viewport.height}px`;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;
                wrapper.appendChild(canvas);
                container.appendChild(wrapper);
                await page.render({
                    canvasContext: context,
                    viewport,
                    transform: [outputScale, 0, 0, outputScale, 0, 0],
                }).promise;
                if (cancelled) return;

                const textLayerDiv = document.createElement('div');
                textLayerDiv.className = 'textLayer absolute inset-0 overflow-hidden';
                textLayerDiv.style.setProperty('--scale-factor', String(viewport.scale));
                wrapper.appendChild(textLayerDiv);
                const textLayer = new TextLayer({
                    textContentSource: await page.getTextContent(),
                    container: textLayerDiv,
                    viewport,
                });
                await textLayer.render();
                if (activePhrase) {
                    const phrase = activePhrase.toLocaleLowerCase();
                    textLayerDiv.querySelectorAll('span').forEach((span) => {
                        if (span.textContent?.toLocaleLowerCase().includes(phrase)) {
                            span.style.backgroundColor = highlightColors[activeCategory] || highlightColors.repetition;
                            span.style.borderRadius = '2px';
                        }
                    });
                }
            }
        }

        renderPdf().catch(() => {
            if (!cancelled) container.textContent = 'Unable to render this PDF preview.';
        });
        return () => { cancelled = true; };
    }, [file, activePhrase, activeCategory]);

    return <div ref={containerRef} className="flex min-h-[680px] flex-col items-center gap-5 overflow-auto bg-slate-200 p-5" />;
}
