import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    PAGE_W, PAGE, GAP, STRIDE, MARGIN,
    SECTION_CATALOG, META, blankItem, profileToResume, resumeToProfile,
    AddButton, RemoveButton,
} from './shared';
import userService from '../services/user.service';
import docService from '../services/doc.service';
import PricingModal from '../components/payment/PricingModal';
import ResumeUploadButton from '../components/profile/ResumeUploadButton';

const ITEM_MARGIN = { exp: 'mb-4', proj: 'mb-4', edu: 'mb-3', courses: 'mb-1.5', pair: 'mb-1', simple: 'mb-1' };

const topLevelBlocks = (root) =>
    Array.from(root.querySelectorAll('[data-block]')).filter((b) => !b.parentElement?.closest('[data-block]'));

const breakUnits = (root, usable, scale = 1) => {
    const units = [];
    for (const sec of topLevelBlocks(root)) {
        if (sec.getBoundingClientRect().height / scale <= usable + 0.5) {
            units.push(sec);
        } else {
            const items = Array.from(sec.querySelectorAll('[data-block]'));
            units.push(...(items.length ? items : [sec]));
        }
    }
    return units;
};

const FONT_OPTIONS = [
    { label: 'Template default', value: '' },
    { label: 'Serif (Georgia)', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Sans (Inter)', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
    { label: 'Slab serif', value: '"Roboto Slab", Georgia, serif' },
    { label: 'Monospace', value: 'ui-monospace, "SF Mono", Menlo, monospace' },
];
const ACCENTS = ['#0f172a', '#0f766e', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#db2777', '#0891b2'];

function atsChecks(r) {
    return [
        { label: 'Name and contact details', ok: !!r.name && (!!r.email || !!r.phone) },
        { label: 'Professional summary', ok: !!(r.summary && r.summary.trim()) },
        { label: 'At least one experience entry', ok: (r.experience || []).some((e) => e.primary || e.secondary) },
        { label: 'Experience has bullet points', ok: (r.experience || []).some((e) => (e.bullets || []).some((b) => b.text && b.text.trim())) },
        { label: 'Quantified results (numbers in bullets)', ok: (r.experience || []).some((e) => (e.bullets || []).some((b) => /\d/.test(b.text || ''))) },
        { label: 'Skills listed', ok: (r.skills || []).some((s) => s.value || s.label) },
        { label: 'Education added', ok: (r.education || []).some((e) => e.school || e.degree) },
    ];
}

export default function ResumeWorkspace({ design, initialProfile = null, authed = false }) {
    const [resume, setResume] = useState(() => profileToResume(initialProfile));
    const [order, setOrder] = useState(() => resume._order || ['summary', 'experience', 'skills', 'courses', 'education']);
    const [pageCount, setPageCount] = useState(1);
    const [dragType, setDragType] = useState(null);
    const [overType, setOverType] = useState(null);
    const [toolbar, setToolbar] = useState(null);
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [panel, setPanel] = useState(null);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fitScale, setFitScale] = useState(1);
    const [locked, setLocked] = useState(true);
    const [docId, setDocId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authed) { setLocked(true); return; }
        docService.openByTemplate(design.code)
            .then((doc) => { setDocId(doc.id); setLocked(!doc.unlocked); })
            .catch(() => setLocked(true));
    }, [authed, design.code]);
    const [settings, setSettings] = useState(() => ({
        margin: MARGIN, spacing: 24, fontSize: 14, lineHeight: 1.2, fontFamily: '', accent: design.accent || '#0f766e',
    }));
    const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));
    const resetDesign = () => setSettings({ margin: MARGIN, spacing: 24, fontSize: 14, lineHeight: 1.2, fontFamily: '', accent: design.accent || '#0f766e' });
    const sheetRef = useRef(null);
    const canvasRef = useRef(null);
    const scaleRef = useRef(1);
    const scheduleRef = useRef(() => {});
    const settingsRef = useRef(settings);
    const savedRangeRef = useRef(null);
    const pickingRef = useRef(false);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    // Fit the fixed-width (Letter) sheet to the viewport: keep the 816px layout (so pagination & PDF
    // stay correct) but visually scale it down on smaller screens.
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return undefined;
        const compute = () => {
            const avail = el.clientWidth - 32; // px-4 padding both sides
            const s = Math.min(1, Math.max(0.25, avail / PAGE_W));
            scaleRef.current = s;
            setFitScale(s);
            scheduleRef.current?.();
        };
        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!previewUrl) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [previewUrl]);

    const setField = (key, value) => setResume((r) => ({ ...r, [key]: value }));
    const updateItem = (type, id, changes) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, ...changes } : it)) }));
    const addItem = (type) => setResume((r) => ({ ...r, [type]: [...(r[type] || []), blankItem(META[type].kind)] }));
    const removeItem = (type, id) => setResume((r) => { const arr = (r[type] || []).filter((it) => it.id !== id); return { ...r, [type]: arr.length ? arr : [blankItem(META[type].kind)] }; });
    const updateBullet = (type, id, bid, text) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: it.bullets.map((b) => (b.id === bid ? { ...b, text } : b)) } : it)) }));
    const addBullet = (type, id) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: [...(it.bullets || []), blankItem('simple')] } : it)) }));
    const removeBullet = (type, id, bid) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: it.bullets.filter((b) => b.id !== bid) } : it)) }));

    const moveSection = (from, to) => {
        if (!from || from === to) return;
        setOrder((prev) => { const arr = prev.filter((t) => t !== from); const idx = to ? arr.indexOf(to) : arr.length; arr.splice(idx < 0 ? arr.length : idx, 0, from); return arr; });
    };
    const removeSection = (type) => setOrder((prev) => prev.filter((t) => t !== type));
    const addSection = (type) => {
        setOrder((prev) => (prev.includes(type) ? prev : [...prev, type]));
        if (META[type].kind !== 'text') setResume((r) => (r[type] && r[type].length ? r : { ...r, [type]: [blankItem(META[type].kind)] }));
        setAdding(false);
    };

    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        let raf = 0;
        let ro;
        const measureApply = () => {
            sheet.querySelectorAll('[data-block]').forEach((b) => { b.style.marginTop = ''; });
            const s = scaleRef.current || 1;   // sheet may be visually scaled to fit; normalize to layout px
            const M = settingsRef.current.margin;
            const usable = PAGE - 2 * M;
            const sheetTop = sheet.getBoundingClientRect().top;

            // Push blocks down so none straddle a page boundary; returns the last page index used.
            const paginate = (root) => {
                const blocks = breakUnits(root, usable, s);
                const data = blocks.map((b) => { const r = b.getBoundingClientRect(); return { el: b, top: (r.top - sheetTop) / s, h: r.height / s }; });
                let page = 0, push = 0;
                for (const d of data) {
                    const curTop = d.top + push;
                    const pageBottom = page * STRIDE + (PAGE - M);
                    if (d.h <= usable && curTop + d.h > pageBottom + 1) {
                        page += 1;
                        const delta = page * STRIDE + M - curTop;
                        d.el.style.marginTop = `${delta}px`;
                        push += delta;
                    }
                }
                return page;
            };

            // Two-column: paginate each column independently against the same page boundaries so
            // blocks don't cross a page break and both columns stay aligned to the same pages.
            if (design.layout?.type === 'two-column') {
                let maxPage = 0;
                sheet.querySelectorAll('[data-rb-col]').forEach((col) => {
                    maxPage = Math.max(maxPage, paginate(col));
                });
                setPageCount(maxPage + 1);
                return;
            }

            setPageCount(paginate(sheet) + 1);
        };
        const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (ro) ro.disconnect(); measureApply(); raf = requestAnimationFrame(() => { if (ro) ro.observe(sheet); }); }); };
        scheduleRef.current = schedule;
        const clearPushes = () => sheet.querySelectorAll('[data-block]').forEach((b) => { b.style.marginTop = ''; });
        schedule();
        ro = new ResizeObserver(schedule);
        ro.observe(sheet);
        sheet.addEventListener('input', schedule);
        window.addEventListener('beforeprint', clearPushes);
        window.addEventListener('afterprint', schedule);
        return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); sheet.removeEventListener('input', schedule); window.removeEventListener('beforeprint', clearPushes); window.removeEventListener('afterprint', schedule); };
    }, [design]);

    useEffect(() => { scheduleRef.current(); }, [order, resume, design, settings]);


    useEffect(() => {
        const onSelect = () => {
            if (pickingRef.current) return;
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setToolbar(null); return; }
            const node = sel.anchorNode;
            const el = node && (node.nodeType === 3 ? node.parentElement : node);
            const sheet = sheetRef.current;
            if (!el || !sheet || !sheet.contains(el) || !el.closest('.editable')) { setToolbar(null); return; }
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            if (!rect || (rect.width === 0 && rect.height === 0)) { setToolbar(null); return; }
            setToolbar({ top: rect.top - 46, left: rect.left + rect.width / 2 });
        };
        document.addEventListener('selectionchange', onSelect);
        return () => document.removeEventListener('selectionchange', onSelect);
    }, []);
    const format = (cmd) => document.execCommand(cmd, false, null);
    const addLink = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const range = sel.getRangeAt(0).cloneRange();
        const inp = window.prompt('Enter the URL to link to:', 'https://');
        if (!inp) return;
        let href = inp.trim();
        if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) href = `https://${href}`;
        sel.removeAllRanges(); sel.addRange(range);
        document.execCommand('createLink', false, href);
        sheetRef.current?.querySelectorAll('a:not([target])').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
    };

    const restoreSelection = () => {
        const range = savedRangeRef.current;
        if (!range) return false;
        const node = range.commonAncestorContainer;
        const el = node.nodeType === 3 ? node.parentElement : node;
        el?.closest?.('.editable')?.focus({ preventScroll: true });
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return !sel.isCollapsed;
    };

    const wrapSelectionStyle = (mutate) => {
        if (!restoreSelection()) return;
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        mutate(span, range);
        try {
            range.surroundContents(span);
        } catch {
            span.appendChild(range.extractContents());
            range.insertNode(span);
        }
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(span);
        sel.addRange(r);
        savedRangeRef.current = r.cloneRange();
        span.closest('.editable')?.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyColor = (color) => wrapSelectionStyle((span) => { span.style.color = color; });

    const stepFontSize = (delta) => wrapSelectionStyle((span, range) => {
        const start = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
        const current = parseFloat(window.getComputedStyle(start).fontSize) || 14;
        span.style.fontSize = `${Math.min(48, Math.max(8, Math.round(current + delta)))}px`;
    });

    const unlock = async () => {
        if (!authed) {
            toast.error('Sign in to unlock your resume');
            navigate('/login');
            return;
        }
        setSaving(true);
        try { await userService.updateProfile(resumeToProfile(resume)); } catch { /* ignore */ }
        try {
            const doc = await docService.openByTemplate(design.code);
            setDocId(doc.id);
            await docService.claim(doc.id);
            setLocked(false);
            toast.success('Resume unlocked — you can download it now');
        } catch (err) {
            if (err?.response?.status === 402) {
                setPricingOpen(true);
            } else {
                toast.error(err?.response?.data?.message || 'Could not unlock this resume');
            }
        } finally {
            setSaving(false);
        }
    };

    const buildPdf = async () => {
        if (authed) {
            try { await userService.updateProfile(resumeToProfile(resume)); } catch { /* ignore */ }
        }
        const sheet = sheetRef.current;
        if (!sheet) return null;

        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
            import('html2canvas-pro'),
            import('jspdf'),
        ]);

        const margin = settings.margin;
        const usable = Math.max(1, PAGE - 2 * margin);
        const holder = document.createElement('div');
        holder.style.cssText = `position:fixed; left:-100000px; top:0; width:${PAGE_W}px; background:#ffffff;`;
        const clone = sheet.cloneNode(true);
        clone.style.margin = '0';
        clone.style.paddingTop = '0px';
        clone.style.paddingBottom = '0px';
        clone.querySelectorAll('.no-print').forEach((el) => el.remove());
        clone.querySelectorAll('[data-block]').forEach((b) => { b.style.marginTop = ''; });
        // Keep empty fields blank in the PDF (the image capture ignores @media print).
        clone.querySelectorAll('.editable').forEach((el) => { if (!el.textContent.trim()) el.removeAttribute('data-ph'); });
        clone.querySelectorAll('.period-ph').forEach((el) => el.remove());
        holder.appendChild(clone);
        document.body.appendChild(holder);

        try {
            try { await document.fonts?.ready; } catch { /* ignore */ }
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            const cTop = clone.getBoundingClientRect().top;
            const segs = [];
            let pageStart = 0;
            let lastBottom = 0;
            breakUnits(clone, usable).forEach((b) => {
                const r = b.getBoundingClientRect();
                const top = r.top - cTop;
                const bottom = r.bottom - cTop;
                if (top > pageStart + 0.5 && bottom - pageStart > usable + 0.5) {
                    segs.push({ top: pageStart, bottom: lastBottom });
                    pageStart = top;
                }
                lastBottom = Math.max(lastBottom, bottom);
            });
            segs.push({ top: pageStart, bottom: lastBottom });

            const scale = 2;
            const canvas = await html2canvas(clone, { scale, backgroundColor: '#ffffff', useCORS: true });

            const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
            const pageWpt = pdf.internal.pageSize.getWidth();
            const factor = pageWpt / canvas.width;
            const marginPt = margin * scale * factor;
            const usablePx = usable * scale;
            const cssToPt = pageWpt / PAGE_W;
            const pageRanges = [];
            let pageIdx = 0;
            for (const seg of segs) {
                let y = seg.top * scale;
                const end = Math.min(seg.bottom * scale, canvas.height);
                while (y < end - 0.5) {
                    const h = Math.min(usablePx, end - y);
                    const slice = document.createElement('canvas');
                    slice.width = canvas.width;
                    slice.height = h;
                    const ctx = slice.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, slice.width, slice.height);
                    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
                    if (pageIdx > 0) pdf.addPage();
                    pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, marginPt, pageWpt, h * factor);
                    pageRanges.push({ topCss: y / scale, bottomCss: (y + h) / scale });
                    pageIdx += 1;
                    y += h;
                }
            }

            const cRect = clone.getBoundingClientRect();
            clone.querySelectorAll('a[href]').forEach((a) => {
                const href = a.getAttribute('href');
                if (!href || !/^(https?:|mailto:|tel:)/i.test(href)) return;
                for (const lr of a.getClientRects()) {
                    const topCss = lr.top - cRect.top;
                    const leftCss = lr.left - cRect.left;
                    const centerCss = topCss + lr.height / 2;
                    const pIndex = pageRanges.findIndex((p) => centerCss >= p.topCss - 0.5 && centerCss < p.bottomCss + 0.5);
                    if (pIndex < 0) continue;
                    pdf.setPage(pIndex + 1);
                    pdf.link(
                        leftCss * cssToPt,
                        marginPt + (topCss - pageRanges[pIndex].topCss) * cssToPt,
                        lr.width * cssToPt,
                        lr.height * cssToPt,
                        { url: href },
                    );
                }
            });

            return pdf;
        } finally {
            if (holder.parentNode) holder.parentNode.removeChild(holder);
        }
    };

    const pdfName = () => `${(resume.name || 'resume').trim() || 'resume'}.pdf`;

    const ensureUnlocked = () => {
        if (!authed) {
            toast.error('Sign in to download your resume');
            navigate('/login');
            return false;
        }
        if (locked) {
            unlock();
            return false;
        }
        return true;
    };

    const download = async () => {
        if (!ensureUnlocked()) return;
        setSaving(true);
        try {
            const pdf = await buildPdf();
            if (pdf) pdf.save(pdfName());
            else window.print();
        } catch {
            toast.error('Could not generate the PDF — opening print instead');
            window.print();
        } finally {
            setSaving(false);
        }
    };

    const preview = async () => {
        if (!ensureUnlocked()) return;
        setSaving(true);
        try {
            const pdf = await buildPdf();
            if (!pdf) { window.print(); return; }
            const url = URL.createObjectURL(pdf.output('blob'));
            setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        } catch {
            toast.error('Could not generate the preview');
        } finally {
            setSaving(false);
        }
    };

    const closePreview = () => setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });

    const renderBody = (type, col = 'main') => {
        const meta = META[type];
        if (meta.kind === 'text') {
            return <div data-block>{design.renderText(resume[type] || '', (v) => setField(type, v), meta.ph, col)}</div>;
        }
        const items = resume[type] || [];
        return (
            <>
                {items.map((it) => (
                    <div key={it.id} data-block className={`group/item relative ${ITEM_MARGIN[meta.kind] || 'mb-2'}`}>
                        <RemoveButton onClick={() => removeItem(type, it.id)} />
                        {design.renderItem(meta.kind, {
                            item: it,
                            update: (changes) => updateItem(type, it.id, changes),
                            bullets: {
                                list: it.bullets || [],
                                update: (bid, text) => updateBullet(type, it.id, bid, text),
                                add: () => addBullet(type, it.id),
                                remove: (bid) => removeBullet(type, it.id, bid),
                            },
                            primaryPh: meta.primaryPh,
                            secondaryPh: meta.secondaryPh,
                            ph: meta.ph,
                            col,
                            type,
                        })}
                    </div>
                ))}
                <AddButton onClick={() => addItem(type)}>Add {meta.addLabel || 'item'}</AddButton>
            </>
        );
    };

    const renderSection = (type, col = 'main') => (
        <div
            key={type}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverType(type); }}
            onDrop={(e) => { e.preventDefault(); moveSection(dragType, type); setDragType(null); setOverType(null); }}
            style={{ marginTop: settings.spacing }}
            className={`group/sec relative transition-opacity ${dragType === type ? 'opacity-40' : ''}`}
        >
            {overType === type && dragType && dragType !== type && (
                <div className="no-print pointer-events-none absolute -top-2 left-0 right-0 z-20 h-0.5 rounded bg-teal-500" />
            )}
            <div
                data-block draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', type); setDragType(type); }}
                onDragEnd={() => { setDragType(null); setOverType(null); }}
                title="Drag this heading to move the whole section"
                className="relative cursor-grab select-none rounded-md transition active:cursor-grabbing group-hover/sec:bg-teal-50/40"
            >
                <span className="no-print absolute left-1 top-1 z-10 text-slate-300 opacity-0 transition group-hover/sec:opacity-100">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
                </span>
                {design.renderTitle(META[type].title, col, type)}
            </div>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => removeSection(type)} title="Remove this section" className="no-print absolute -right-9 top-6 hidden h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 group-hover/sec:flex group-focus-within/sec:flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {renderBody(type, col)}
        </div>
    );

    const available = SECTION_CATALOG.filter((s) => !order.includes(s.type));
    const stackHeight = pageCount * PAGE + (pageCount - 1) * GAP;
    const checks = atsChecks(resume);
    const passed = checks.filter((c) => c.ok).length;

    return (
        <div id="rb-root" className="min-h-screen bg-slate-200/70">
            <style>{`
        .editable { outline: none; cursor: text; min-width: 1ch; border-radius: 3px; }
        .editable:hover { box-shadow: 0 0 0 2px rgba(13,148,136,0.12); }
        .editable:focus { box-shadow: 0 0 0 2px rgba(13,148,136,0.5); }
        .editable:empty::before { content: attr(data-ph); color: #9ca3af; }
        .editable a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        @page { size: letter; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          #rb-root { background: #fff !important; min-height: 0 !important; }
          #rb-canvas { padding: 0 !important; display: block !important; }
          #rb-stack { position: static !important; width: auto !important; height: auto !important; }
          #resume-sheet { position: static !important; box-shadow: none !important; margin: 0 auto !important; width: 8.5in !important; max-width: none !important; }
          #resume-sheet [data-block] { break-inside: avoid; margin-top: 0 !important; }
          .editable:hover, .editable:focus { box-shadow: none !important; }
          .editable:empty::before { content: "" !important; }
          .period-ph { display: none !important; }
          #resume-sheet button { padding: 0 !important; }
        }
      `}</style>

            <div className="no-print editor-header-bg sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border px-3 shadow-sm sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to="/templates?type=CV_AND_RESUME&page=1&size=50" className="flex shrink-0 items-center gap-2 text-muted-foreground transition hover:text-foreground">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        <span className="hidden text-sm font-medium sm:inline">Templates</span>
                    </Link>
                    <div className="hidden h-4 w-px bg-border md:block" />
                    <Link to="/my-templates?type=CV_AND_RESUME&page=1&size=50" className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground md:inline">My Templates</Link>
                    {design?.name && <span className="hidden truncate rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent sm:inline">{design.name}</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {authed && (
                        <ResumeUploadButton
                            label="Upload CV"
                            confirm="Replace your current resume details with the uploaded file?"
                            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-60 sm:inline-flex"
                            onDone={(p) => {
                                const r = profileToResume(p);
                                setResume(r);
                                setOrder(r._order || ['summary', 'experience', 'skills', 'courses', 'education']);
                                setDataVersion((v) => v + 1);
                            }}
                        />
                    )}
                    <button
                        onClick={() => setPanel(panel === 'ats' ? null : 'ats')}
                        title="ATS Check"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition sm:px-3 ${panel === 'ats' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-current text-[8px] font-bold">ATS</span>
                        <span className="hidden sm:inline">Check</span>
                    </button>
                    <button
                        onClick={() => setPanel(panel === 'design' ? null : 'design')}
                        title="Design & Font"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition sm:px-3 ${panel === 'design' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 3a9 9 0 000 18" fill="currentColor" stroke="none" opacity="0.5" /></svg>
                        <span className="hidden sm:inline">Design &amp; Font</span>
                    </button>
                    <button
                        onClick={preview}
                        disabled={saving}
                        title="Preview the PDF before downloading"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-60 sm:px-3"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                    {locked ? (
                        <button
                            onClick={unlock}
                            disabled={saving}
                            title="Unlock this resume (uses one credit)"
                            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:px-4"
                        >
                            {saving ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 109 9" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 00-8 0v3M6 10h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z" /></svg>
                            )}
                            {saving ? 'Working…' : 'Unlock'}
                        </button>
                    ) : (
                        <button
                            onClick={download}
                            disabled={saving}
                            title="Download PDF"
                            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:opacity-60 sm:px-4"
                        >
                            {saving ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 109 9" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                            )}
                            {saving ? 'Saving…' : 'Download'}
                        </button>
                    )}
                </div>
            </div>

            {toolbar && (
                <div
                    className="no-print fixed z-[100000] flex items-center -translate-x-1/2 gap-0.5 rounded-lg bg-slate-900 px-1 py-1 shadow-lg"
                    style={{ top: toolbar.top, left: toolbar.left }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount && !sel.isCollapsed) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                    }}
                >
                    <button onClick={() => format('bold')} title="Bold" className="h-7 w-7 rounded text-sm font-bold text-white transition hover:bg-white/15">B</button>
                    <button onClick={() => format('italic')} title="Italic" className="h-7 w-7 rounded text-sm italic text-white transition hover:bg-white/15">I</button>
                    <button onClick={() => format('underline')} title="Underline" className="h-7 w-7 rounded text-sm text-white underline transition hover:bg-white/15">U</button>
                    <span className="my-1 w-px bg-white/20" />
                    <label
                        title="Text color"
                        className="relative flex h-7 w-7 cursor-pointer flex-col items-center justify-center rounded text-white transition hover:bg-white/15"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            pickingRef.current = true;
                            const sel = window.getSelection();
                            if (sel && sel.rangeCount && !sel.isCollapsed) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                        }}
                    >
                        <span className="text-sm font-semibold leading-none">A</span>
                        <span className="mt-0.5 h-1 w-4 rounded bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500" />
                        <input
                            type="color"
                            onChange={(e) => applyColor(e.target.value)}
                            onBlur={() => { pickingRef.current = false; }}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                    </label>
                    <button onClick={() => stepFontSize(-2)} title="Decrease font size" className="h-7 w-7 rounded text-xs font-bold text-white transition hover:bg-white/15">A−</button>
                    <button onClick={() => stepFontSize(2)} title="Increase font size" className="h-7 w-7 rounded text-sm font-bold text-white transition hover:bg-white/15">A+</button>
                    <span className="my-1 w-px bg-white/20" />
                    <button onClick={addLink} title="Add link" className="flex h-7 w-7 items-center justify-center rounded text-white transition hover:bg-white/15">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    </button>
                </div>
            )}

            <div id="rb-canvas" ref={canvasRef} className={`flex justify-center overflow-hidden px-4 py-8 ${panel === 'design' ? 'md:ml-80' : ''} ${panel === 'ats' ? 'md:mr-80' : ''}`}>
                <div style={{ width: PAGE_W * fitScale, height: stackHeight * fitScale }}>
                <div id="rb-stack" className="relative" style={{ width: PAGE_W, height: stackHeight, transform: `scale(${fitScale})`, transformOrigin: 'top left' }}>
                    {Array.from({ length: pageCount }).map((_, p) => (
                        <div key={p} className="no-print absolute inset-x-0 rounded-sm bg-white shadow-xl" style={{ top: p * STRIDE, height: PAGE }} />
                    ))}

                    <div
                        key={dataVersion}
                        id="resume-sheet"
                        ref={sheetRef}
                        className={`relative z-10 ${design.sheetClass}`}
                        style={{
                            padding: settings.margin,
                            fontSize: `${settings.fontSize}px`,
                            lineHeight: settings.lineHeight,
                            fontFamily: settings.fontFamily || undefined,
                            '--rb-accent': settings.accent,
                        }}
                    >
                        {design.layout?.type === 'two-column' ? (() => {
                            const lay = design.layout;
                            const skip = lay.skipSections || [];
                            const inSidebar = (t) => lay.sidebar?.includes(t);
                            const sideTypes = order.filter((t) => inSidebar(t) && !skip.includes(t));
                            const mainTypes = order.filter((t) => !inSidebar(t) && !skip.includes(t));
                            const sidebarCol = (
                                <div data-rb-col className={`shrink-0 ${lay.sidebarClass || ''}`} style={{ width: lay.sidebarWidth || '34%' }}>
                                    {lay.splitHeader && design.renderSidebarHeader && <div data-block>{design.renderSidebarHeader(resume, setField)}</div>}
                                    {sideTypes.map((t) => renderSection(t, 'sidebar'))}
                                </div>
                            );
                            const mainCol = (
                                <div data-rb-col className="min-w-0 flex-1">
                                    {lay.splitHeader && <header data-block>{design.renderHeader(resume, setField)}</header>}
                                    {mainTypes.map((t) => renderSection(t, 'main'))}
                                </div>
                            );
                            return (
                                <>
                                    {!lay.splitHeader && <header data-block>{design.renderHeader(resume, setField)}</header>}
                                    <div className={`flex items-start ${lay.gap || 'gap-8'} ${lay.splitHeader ? '' : 'mt-2'}`}>
                                        {lay.sidebarSide === 'right'
                                            ? <>{mainCol}{sidebarCol}</>
                                            : <>{sidebarCol}{mainCol}</>}
                                    </div>
                                </>
                            );
                        })() : (
                            <>
                                <header data-block>{design.renderHeader(resume, setField)}</header>
                                {order.map((type) => renderSection(type, 'main'))}
                            </>
                        )}

                        <div className="no-print mt-8">
                            {!adding ? (
                                <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-teal-400 hover:bg-teal-50/40 hover:text-teal-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                                    Add section
                                </button>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-700">Add a section</p>
                                        <button onClick={() => setAdding(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    {available.length ? (
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {available.map((s) => (
                                                <button key={s.type} onClick={() => addSection(s.type)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 shrink-0 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                                                    {s.title}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-slate-400">All available sections have been added.</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {locked && (
                        <div className="no-print absolute inset-x-0 bottom-0 z-30 overflow-hidden rounded-sm" style={{ top: PAGE / 3 }}>
                            <div className="absolute inset-0 bg-white/55 backdrop-blur-md" />
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/80 to-transparent" />
                            <div className="relative mx-auto mt-20 flex max-w-xs flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-7 text-center shadow-2xl">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 00-8 0v3M6 10h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z" /></svg>
                                </span>
                                <p className="text-base font-bold text-slate-900">Unlock your full resume</p>
                                <p className="text-sm leading-relaxed text-slate-500">You're seeing a free preview. Unlock this resume to view every section and download a clean, watermark-free PDF.</p>
                                <button onClick={unlock} disabled={saving} className="mt-1 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">{saving ? 'Working…' : 'Unlock resume'}</button>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>

            {/* Design & Font panel */}
            {panel === 'design' && (
                <aside className="no-print fixed left-0 top-14 bottom-0 z-40 flex w-80 max-w-[88vw] flex-col border-r border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10M4 12h7M4 18h13M16 4v4M11 10v4M17 16v4" /></svg>
                            </span>
                            <div>
                                <h3 className="text-sm font-bold leading-tight text-slate-800">Design &amp; Font</h3>
                                <p className="text-[11px] text-slate-400">Make it yours</p>
                            </div>
                        </div>
                        <button onClick={() => setPanel(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
                        <PanelSection title="Accent color">
                            <div className="flex flex-wrap gap-2.5">
                                {ACCENTS.map((c) => {
                                    const active = settings.accent === c;
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => setSetting('accent', c)}
                                            title={c}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${active ? 'ring-2 ring-slate-900 ring-offset-2' : 'ring-1 ring-inset ring-black/10 hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        >
                                            {active && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                    );
                                })}
                                <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-teal-400 hover:text-teal-500" title="Custom color">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                                    <input type="color" value={settings.accent} onChange={(e) => setSetting('accent', e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                </label>
                            </div>
                        </PanelSection>

                        <PanelSection title="Font">
                            <div className="space-y-1.5">
                                {FONT_OPTIONS.map((f) => {
                                    const active = settings.fontFamily === f.value;
                                    return (
                                        <button
                                            key={f.label}
                                            onClick={() => setSetting('fontFamily', f.value)}
                                            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${active ? 'border-teal-500 bg-teal-50/70' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-sm text-slate-800" style={{ fontFamily: f.value || 'Inter, system-ui, sans-serif' }}>{f.label}</span>
                                            {active && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 text-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                    );
                                })}
                            </div>
                        </PanelSection>

                        <PanelSection title="Typography">
                            <SliderRow label="Font size" display={`${settings.fontSize}px`} value={settings.fontSize} min={11} max={20} step={1} onChange={(e) => setSetting('fontSize', Number(e.target.value))} />
                            <SliderRow label="Line height" display={settings.lineHeight.toFixed(2)} value={settings.lineHeight} min={1.1} max={1.9} step={0.05} onChange={(e) => setSetting('lineHeight', Number(e.target.value))} />
                        </PanelSection>

                        <PanelSection title="Layout">
                            <SliderRow label="Page margins" display={`${settings.margin}px`} value={settings.margin} min={24} max={80} step={1} onChange={(e) => setSetting('margin', Number(e.target.value))} />
                            <SliderRow label="Section spacing" display={`${settings.spacing}px`} value={settings.spacing} min={8} max={48} step={1} onChange={(e) => setSetting('spacing', Number(e.target.value))} />
                        </PanelSection>
                    </div>

                    <div className="border-t border-slate-100 px-5 py-3">
                        <button onClick={resetDesign} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5" /></svg>
                            Reset to template default
                        </button>
                    </div>
                </aside>
            )}

            {/* ATS Check panel */}
            {panel === 'ats' && (
                <div className="no-print fixed right-0 top-14 bottom-0 z-40 w-80 max-w-[88vw] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">ATS Check</h3>
                        <button onClick={() => setPanel(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="mb-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${passed === checks.length ? 'bg-emerald-500' : passed >= checks.length - 2 ? 'bg-teal-500' : 'bg-amber-500'}`}>
                            {Math.round((passed / checks.length) * 100)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{passed} of {checks.length} checks passed</p>
                            <p className="text-xs text-slate-500">Fix the items below to improve parsing.</p>
                        </div>
                    </div>
                    <ul className="space-y-2.5">
                        {checks.map((c) => (
                            <li key={c.label} className="flex items-start gap-2.5 text-sm">
                                {c.ok ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86l-8.3 14A1 1 0 003 19h18a1 1 0 00.86-1.5l-8.3-14a1 1 0 00-1.72 0z" /></svg>
                                )}
                                <span className={c.ok ? 'text-slate-600' : 'font-medium text-slate-800'}>{c.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                onSuccess={() => { setPricingOpen(false); unlock(); }}
                title="Upgrade to download your resume"
            />

            {previewUrl && (
                <div className="no-print fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/70 p-4" onClick={closePreview}>
                    <div
                        className="flex h-[92vh] w-full max-w-[850px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-800">PDF preview</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={download}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:opacity-60"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                                    Download
                                </button>
                                <button
                                    onClick={closePreview}
                                    className="inline-flex items-center justify-center rounded-full border border-slate-300 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                    title="Close"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <iframe
                            src={previewUrl}
                            title="PDF preview"
                            className="min-h-0 flex-1 border-0 bg-slate-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function PanelSection({ title, children }) {
    return (
        <section>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
            {children}
        </section>
    );
}

function SliderRow({ label, display, value, min, max, step = 1, onChange }) {
    return (
        <div className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-600">{label}</span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">{display}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full accent-teal-500" />
        </div>
    );
}
