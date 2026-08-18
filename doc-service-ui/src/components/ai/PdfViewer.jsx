import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextLayer } from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

// Severity → highlight colour (red / yellow / green / blue).
export const severityColors = {
    bad: 'rgba(248, 113, 113, 0.55)',
    warning: 'rgba(251, 191, 36, 0.55)',
    good: 'rgba(52, 211, 153, 0.55)',
    info: 'rgba(96, 165, 250, 0.55)',
};

const legacyColors = {
    repetition: severityColors.bad,
    buzzwords: severityColors.warning,
    readability: severityColors.info,
    growth: severityColors.good,
};

const PAD = 0;

export default function PdfViewer({ file, highlights, activePhrase, activeCategory }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        let frame = 0;
        const measure = () => {
            const el = containerRef.current;
            if (!el) return;
            const w = Math.floor(el.clientWidth);
            setWidth((prev) => (Math.abs(prev - w) > 8 ? w : prev));
        };
        measure();
        const onResize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); };
    }, []);

    useEffect(() => {
        if (!file || !containerRef.current || !width) return undefined;
        let cancelled = false;
        const container = containerRef.current;
        const marks = (highlights && highlights.length)
            ? highlights
            : (activePhrase ? [{ phrase: activePhrase, color: legacyColors[activeCategory] || severityColors.bad }] : []);

        async function renderPdf() {
            container.replaceChildren();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
            const outputScale = (window.devicePixelRatio || 1) * 2;
            // Reserve room for a possible vertical scrollbar so a horizontal scrollbar never appears.
            const availableW = width - PAD * 2 - 16;

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                if (cancelled) return;
                const page = await pdf.getPage(pageNumber);
                const base = page.getViewport({ scale: 1 });
                // Fit to the full pane WIDTH; taller pages scroll vertically.
                const scale = Math.max(0.2, availableW / base.width);
                const viewport = page.getViewport({ scale });

                const wrapper = document.createElement('div');
                wrapper.className = 'relative shrink-0 overflow-hidden bg-white';
                wrapper.style.width = `${viewport.width}px`;
                wrapper.style.height = `${viewport.height}px`;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
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
                applyHighlights(textLayerDiv, marks);
            }
        }

        renderPdf().catch(() => {
            if (!cancelled) container.textContent = 'Unable to render this PDF preview.';
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file, width, activePhrase, activeCategory, JSON.stringify(highlights || [])]);

    return <div ref={containerRef} className="flex h-full min-h-[60vh] w-full flex-col gap-1.5 overflow-y-auto overflow-x-hidden bg-muted" />;
}

// ---------------- Accurate highlighting ----------------

/** Normalize to lowercase alphanumerics + single spaces, keeping a map back to original indices. */
function normalize(str) {
    let norm = '';
    const map = [];
    let prevSpace = false;
    for (let i = 0; i < str.length; i += 1) {
        const ch = str[i];
        if (/[a-z0-9]/i.test(ch)) {
            norm += ch.toLowerCase();
            map.push(i);
            prevSpace = false;
        } else if (/\s/.test(ch)) {
            if (norm.length && !prevSpace) { norm += ' '; map.push(i); prevSpace = true; }
        }
        // punctuation is dropped so "results-driven" == "results driven" == "resultsdriven"
    }
    return { norm, map };
}

function applyHighlights(layer, marks) {
    const clean = (marks || []).filter((m) => m.phrase && m.phrase.trim());
    if (!clean.length) return;
    const spans = [...layer.querySelectorAll('span')].filter((s) => s.firstChild && s.textContent);
    if (!spans.length) return;

    let full = '';
    const segs = [];
    spans.forEach((s) => {
        const t = s.textContent;
        segs.push({ s, start: full.length, end: full.length + t.length });
        full += t;
    });
    const { norm, map } = normalize(full);

    clean.forEach(({ phrase, color }) => {
        const p = normalize(phrase).norm.trim();
        if (!p) return;
        let from = 0;
        let idx = norm.indexOf(p, from);
        while (idx !== -1) {
            const nEnd = idx + p.length;
            const before = idx > 0 ? norm[idx - 1] : ' ';
            const after = nEnd < norm.length ? norm[nEnd] : ' ';
            // short phrases must sit on word boundaries so "led" doesn't match inside "fulfilled"
            const boundaryOk = p.replace(/\s/g, '').length > 3 || (before === ' ' && after === ' ');
            if (boundaryOk) {
                const oStart = map[idx];
                const oEnd = map[nEnd - 1] + 1;
                segs.forEach((seg) => {
                    if (seg.end <= oStart || seg.start >= oEnd) return;
                    wrapRange(seg.s, Math.max(0, oStart - seg.start), Math.min(seg.end - seg.start, oEnd - seg.start), color);
                });
            }
            from = nEnd;
            idx = norm.indexOf(p, from);
        }
    });
}

function wrapRange(span, s, e, color) {
    const node = span.firstChild;
    if (!node || node.nodeType !== 3) {
        span.style.backgroundColor = color;
        span.style.borderRadius = '2px';
        return;
    }
    const v = node.nodeValue;
    if (s <= 0 && e >= v.length) {
        span.style.backgroundColor = color;
        span.style.borderRadius = '2px';
        return;
    }
    const frag = document.createDocumentFragment();
    if (s > 0) frag.appendChild(document.createTextNode(v.slice(0, s)));
    const mark = document.createElement('span');
    mark.textContent = v.slice(s, e);
    mark.style.backgroundColor = color;
    mark.style.borderRadius = '2px';
    frag.appendChild(mark);
    if (e < v.length) frag.appendChild(document.createTextNode(v.slice(e)));
    span.replaceChildren(frag);
}
