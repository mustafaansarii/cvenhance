import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

// Mobile browsers can't render a PDF inside an <iframe>/blob, so on small screens we
// paint each page to a <canvas> with pdf.js. Desktop keeps the native iframe viewer.
export default function PdfPreviewPane({ url, className = '' }) {
    const [isSmall, setIsSmall] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)');
        const onChange = (e) => setIsSmall(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    if (!isSmall) {
        return (
            <iframe
                src={`${url}#view=FitH&toolbar=0&navpanes=0`}
                title="PDF preview"
                className={className}
            />
        );
    }
    return <CanvasPdf url={url} className={className} />;
}

function CanvasPdf({ url, className }) {
    const wrapRef = useRef(null);
    const [status, setStatus] = useState('loading'); // loading | ready | error

    useEffect(() => {
        let cancelled = false;
        const wrap = wrapRef.current;
        if (!wrap) return undefined;

        (async () => {
            try {
                setStatus('loading');
                wrap.innerHTML = '';
                const pdf = await pdfjsLib.getDocument({ url }).promise;
                if (cancelled) return;
                const width = Math.max(280, wrap.clientWidth - 24);
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                for (let n = 1; n <= pdf.numPages; n += 1) {
                    const page = await pdf.getPage(n); // eslint-disable-line no-await-in-loop
                    if (cancelled) return;
                    const base = page.getViewport({ scale: 1 });
                    const scale = width / base.width;
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.floor(viewport.width * dpr);
                    canvas.height = Math.floor(viewport.height * dpr);
                    canvas.style.width = '100%';
                    canvas.style.height = 'auto';
                    canvas.className = 'mb-3 rounded bg-white shadow';
                    wrap.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    ctx.scale(dpr, dpr);
                    await page.render({ canvasContext: ctx, viewport }).promise; // eslint-disable-line no-await-in-loop
                }
                if (!cancelled) setStatus('ready');
            } catch {
                if (!cancelled) setStatus('error');
            }
        })();

        return () => { cancelled = true; };
    }, [url]);

    return (
        <div className={`overflow-y-auto bg-muted p-3 ${className}`}>
            {status === 'loading' && (
                <div className="flex h-full items-center justify-center py-10 text-sm text-muted-foreground">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 109 9" /></svg>
                    Rendering preview…
                </div>
            )}
            {status === 'error' && (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
                    <p>Couldn&apos;t render the preview here.</p>
                    <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground">Open PDF</a>
                </div>
            )}
            <div ref={wrapRef} className={status === 'ready' ? '' : 'hidden'} />
        </div>
    );
}
