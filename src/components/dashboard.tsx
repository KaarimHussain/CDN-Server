'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ListBlobResultBlob } from '@vercel/blob';

interface DashboardProps {
    initialBlobs: ListBlobResultBlob[];
}

export default function Dashboard({ initialBlobs }: DashboardProps) {
    const [blobs, setBlobs] = useState<ListBlobResultBlob[]>(initialBlobs);
    const [apiKey, setApiKey] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('cdn_key');
        if (storedKey) {
            setApiKey(storedKey);
            setIsUnlocked(true);
        }
    }, []);

    const handleUnlock = () => {
        if (apiKey.trim().length > 0) {
            localStorage.setItem('cdn_key', apiKey);
            setIsUnlocked(true);
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('cdn_key');
        setApiKey('');
        setIsUnlocked(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        if (!apiKey) {
            toast.error('Please unlock with API Key first');
            return;
        }

        setIsUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: file // Send raw body or FormData? Route expects raw body for `put` usually?
                // Wait, route.ts used `request.body` directly with `put`. 
                // If I send 'file', the browser sends binary. 
                // If I send FormData, I need to parse it on server.
                // My route.ts uses `request.body` which streams the request.
                // Sending the file object directly acts as the body.
            });

            if (!res.ok) throw new Error('Upload failed');

            const newBlob = await res.json();
            setBlobs(prev => [newBlob, ...prev]);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Upload failed. Check your API Key.');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (url: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const res = await fetch(`/api/delete?url=${encodeURIComponent(url)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (!res.ok) throw new Error('Delete failed');

            setBlobs(prev => prev.filter(b => b.url !== url));
            toast.success('Image deleted');
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="p-8 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center">
                    <Lock className="w-12 h-12 text-zinc-500 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Enter Access Key</h2>
                    <p className="text-zinc-400 text-sm mb-4">Enter your CDN_SECRET_KEY to manage assets.</p>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk_..."
                        className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        onClick={handleUnlock}
                        className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-zinc-200 w-full"
                    >
                        Unlock Utility
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Your Assets</h2>
                    <p className="text-zinc-400 text-sm">{blobs.length} items stored</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleClearKey} className="text-xs text-zinc-500 hover:text-white">Lock</button>
                    <label className={cn(
                        "cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                        isUploading && "opacity-50 pointer-events-none"
                    )}>
                        {isUploading ? 'Uploading...' : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload New</span>
                            </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {blobs.map((blob) => (
                    <div key={blob.url} className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                        {/* Image */}
                        <img
                            src={blob.url}
                            alt={blob.pathname}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-zinc-300 truncate mb-2">{blob.pathname}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(blob.url)}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-sm"
                                    title="Copy URL"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <a
                                    href={blob.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-sm"
                                    title="View Original"
                                >
                                    <Eye className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => handleDelete(blob.url)}
                                    className="ml-auto p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-md backdrop-blur-sm"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {blobs.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <p>No images found. Upload your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
