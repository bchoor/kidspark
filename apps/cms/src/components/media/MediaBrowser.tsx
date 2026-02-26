import { useRef, useState } from 'react';
import { useMedia } from '../../hooks/useMedia';
import { api } from '../../lib/api';

interface Props {
    lessonId: number;
}

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';

export function MediaBrowser({ lessonId }: Props) {
    const { media, loading, uploading, error, upload, remove } = useMedia(lessonId);
    const fileRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    async function handleFiles(files: FileList | null) {
        if (!files) return;
        for (const file of Array.from(files)) {
            try { await upload(file); }
            catch (err) { alert(err instanceof Error ? err.message : 'Upload failed'); }
        }
    }

    function copyKey(key: string) {
        navigator.clipboard.writeText(key).catch(() => { });
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    async function handleRemove(id: number) {
        if (!confirm('Delete this file?')) return;
        await remove(id).catch((err: Error) => alert(err.message));
    }

    return (
        <div className="card bg-base-100 shadow space-y-4">
            <div className="card-body p-4 gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Media</h3>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-sm btn-outline">
                        {uploading ? <span className="loading loading-spinner loading-xs" /> : 'Upload File'}
                    </button>
                </div>

                {/* Drop zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => fileRef.current?.click()}
                >
                    <p className="text-sm text-base-content/50">
                        {uploading ? 'Uploading…' : 'Drop files here or click to upload'}
                    </p>
                    <p className="text-xs text-base-content/30 mt-1">PNG, JPG, GIF, WebP, SVG</p>
                </div>

                <input ref={fileRef} type="file" accept={ACCEPTED} multiple hidden
                    onChange={(e) => handleFiles(e.target.files)} />

                {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

                {loading && <div className="flex justify-center py-4"><span className="loading loading-spinner loading-sm" /></div>}

                {!loading && media.length === 0 && (
                    <p className="text-sm text-base-content/40 text-center py-2">No files uploaded yet.</p>
                )}

                {/* Media grid */}
                {media.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {media.map((m) => (
                            <div key={m.id} className="group relative rounded-lg overflow-hidden border border-base-200 bg-base-200 aspect-square">
                                <img
                                    src={api.media.url(m.r2_key)}
                                    alt={m.filename}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                                    <p className="text-white text-xs truncate w-full text-center">{m.filename}</p>
                                    <button
                                        type="button"
                                        onClick={() => copyKey(m.r2_key)}
                                        className="btn btn-xs btn-ghost text-white w-full"
                                    >
                                        {copied === m.r2_key ? '✓ Copied!' : 'Copy Key'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(m.id)}
                                        className="btn btn-xs btn-ghost text-error w-full"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
