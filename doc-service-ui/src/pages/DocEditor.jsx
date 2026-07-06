import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
    ChevronLeftIcon,
    ArrowPathIcon,
    LockClosedIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import docService from '../services/doc.service';
import paymentService from '../services/payment.service';
import PricingModal from '../components/payment/PricingModal';

export default function DocEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const prefetched = location.state?.doc ?? null;

    const [doc, setDoc] = useState(prefetched);
    const [loadingDoc, setLoadingDoc] = useState(!prefetched);
    const [code, setCode] = useState(prefetched?.latexCode || '');
    const [pdfUrl, setPdfUrl] = useState(prefetched?.pdfUrl || '');
    const [compiling, setCompiling] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [locked, setLocked] = useState(true);
    const blobUrlRef = useRef(null);
    const handleCompileRef = useRef(null);
    const lockedRef = useRef(true);
    useEffect(() => { lockedRef.current = locked; }, [locked]);
    const autoCompiledRef = useRef(false);

    useEffect(() => {
        if (prefetched) {
            setLocked(!prefetched.unlocked);
            return;
        }
        docService.getUserDoc(id)
            .then((data) => {
                setDoc(data);
                setCode(data.latexCode || '');
                setPdfUrl(data.pdfUrl || '');
                setLocked(!data.unlocked);
            })
            .catch(() => toast.error('Failed to load document'))
            .finally(() => setLoadingDoc(false));
    }, [id]);

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        };
    }, []);

    const editorContainerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleCompileRef.current?.();
            }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    useEffect(() => {
        if (autoCompiledRef.current || loadingDoc || !code) return;
        autoCompiledRef.current = true;
        handleCompileRef.current?.();
    }, [loadingDoc, code]);

    const handleCompile = async () => {
        if (compiling) return;
        setCompiling(true);
        try {
            const data = await docService.compile(id, code);

            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setPdfUrl(url);
        } catch (err) {
            let msg = 'Compilation failed';
            if (err?.response?.data instanceof Blob) {
                try {
                    const parsed = JSON.parse(await err.response.data.text());
                    msg = parsed?.message || msg;
                } catch {}
            } else {
                msg = err?.response?.data?.message || msg;
            }
            toast.error(msg);
        } finally {
            setCompiling(false);
        }
    };

    handleCompileRef.current = handleCompile;

    const handleUnlock = async () => {
        if (unlocking) return;
        setUnlocking(true);
        try {
            await docService.claim(id);
            setLocked(false);
            toast.success('Resume unlocked — you can download it now');
            handleCompileRef.current?.();
        } catch (err) {
            if (err?.response?.status === 402) {
                setPricingOpen(true);
            } else {
                toast.error(err?.response?.data?.message || 'Could not unlock this resume');
            }
        } finally {
            setUnlocking(false);
        }
    };

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const blob = await paymentService.unlockDoc(id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc?.name ?? 'document'}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setLocked(false);
            toast.success('Downloaded');
        } catch (err) {
            if (err?.response?.status === 402) {
                setPricingOpen(true);
            } else {
                toast.error(err?.response?.data?.message || 'Download failed');
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col bg-muted h-screen">

            <div className="editor-header-bg grid h-12 shrink-0 grid-cols-3 items-center border-b border-border px-2 sm:px-4">

                <div className="flex min-w-0 items-center gap-2">
                    <Link
                        to="/templates?type=CV_AND_RESUME&page=1&size=50"
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-card/50 hover:text-foreground"
                    >
                        <ChevronLeftIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Templates</span>
                    </Link>
                    <div className="hidden h-3.5 w-px bg-border sm:block" />
                    <Link
                        to="/my-templates?type=CV_AND_RESUME&page=1&size=50"
                        className="hidden rounded px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-card/50 hover:text-foreground sm:block"
                    >
                        My Templates
                    </Link>
                    <div className="hidden h-3.5 w-px bg-border md:block" />
                    <span className="hidden truncate text-xs font-medium text-muted-foreground md:inline">
                        {loadingDoc ? 'Loading…' : (doc?.name ?? 'Document Editor')}
                    </span>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleCompile}
                        disabled={compiling || loadingDoc}
                        title="Compile (Ctrl + Enter)"
                        className="group relative flex items-center gap-1.5 rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {compiling ? (
                            <>
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                Compiling…
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-3.5 w-3.5" />
                                Compile
                                <span className="absolute -right-1 -top-2 flex items-center gap-0.5 rounded border border-border bg-card px-1 py-px opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
                                    <kbd className="text-[9px] font-normal text-muted-foreground">Ctrl</kbd>
                                    <span className="text-[9px] text-muted-foreground">+</span>
                                    <kbd className="text-[9px] font-normal text-muted-foreground">↵</kbd>
                                </span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-end gap-1">
                    {locked ? (
                        <button
                            onClick={handleUnlock}
                            disabled={unlocking || loadingDoc}
                            title="Unlock this resume (uses one credit)"
                            className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {unlocking ? (
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <LockClosedIcon className="h-3.5 w-3.5" />
                            )}
                            {unlocking ? 'Unlocking…' : 'Unlock'}
                        </button>
                    ) : (
                        <button
                            onClick={handleDownload}
                            disabled={downloading || loadingDoc}
                            title="Download PDF"
                            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {downloading ? (
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                            )}
                            Download
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

                <div ref={editorContainerRef} className="flex h-1/2 w-full flex-col border-b border-border lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r">
                    {loadingDoc ? (
                        <div className="flex flex-1 items-center justify-center bg-muted">
                            <ArrowPathIcon className="h-6 w-6 animate-spin text-accent" />
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            language="javascript"
                            value={code}
                            onChange={(val) => setCode(val ?? '')}
                            theme="vs-dark"
                            beforeMount={(monaco) => {
                                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                                    noSemanticValidation: true,
                                    noSyntaxValidation: true,
                                    noSuggestionDiagnostics: true,
                                });
                            }}
                            onMount={(editor, monaco) => {
                                editor.addCommand(
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                                    () => handleCompileRef.current()
                                );
                                // Free (locked) plan: block copy / cut / select-all from the keyboard…
                                editor.onKeyDown((e) => {
                                    if (!lockedRef.current) return;
                                    const combo = e.ctrlKey || e.metaKey;
                                    if (combo && [monaco.KeyCode.KeyC, monaco.KeyCode.KeyX, monaco.KeyCode.KeyA].includes(e.keyCode)) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                });
                                // …and block the native copy/cut/context-menu so the code can't be lifted out.
                                const dom = editor.getDomNode();
                                if (dom) {
                                    const block = (ev) => { if (lockedRef.current) { ev.preventDefault(); ev.stopPropagation(); } };
                                    dom.addEventListener('copy', block, true);
                                    dom.addEventListener('cut', block, true);
                                    dom.addEventListener('contextmenu', block, true);
                                }
                            }}
                            options={{
                                fontSize: 14,
                                lineHeight: 22,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                padding: { top: 12, bottom: 12 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                renderValidationDecorations: 'off',
                                readOnly: locked,
                                domReadOnly: locked,
                                contextmenu: !locked,
                            }}
                        />
                    )}
                </div>

                <div className="flex h-1/2 w-full flex-col bg-muted lg:h-full lg:w-1/2">
                    {locked && pdfUrl && (
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-50 px-4 py-2">
                            <p className="text-xs text-amber-800">
                                <span className="font-semibold">Free preview</span> — only the top of page 1 is shown. Unlock to view &amp; download the full resume.
                            </p>
                            <button
                                onClick={handleUnlock}
                                disabled={unlocking}
                                className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60"
                            >
                                {unlocking ? 'Unlocking…' : 'Unlock'}
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        {pdfUrl ? (
                            <iframe
                                key={pdfUrl}
                                src={pdfUrl}
                                title="PDF Preview"
                                className="h-full w-full border-none"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                <DocumentTextIcon className="h-10 w-10 opacity-40" />
                                <p className="text-sm text-muted-foreground">Hit <span className="font-semibold text-accent">Compile</span> to generate a PDF preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                onSuccess={() => { setPricingOpen(false); handleUnlock(); }}
                title="Upgrade to download this resume"
            />
        </div>
    );
}
