
import React, { useEffect, useState } from 'react';
import { ShortenedLink } from '../types';
import { LinkChainIcon } from './icons/LinkChainIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { TrashIcon } from './icons/TrashIcon';


interface LinkShortenerProps {
    links: ShortenedLink[];
    setLinks: React.Dispatch<React.SetStateAction<ShortenedLink[]>>;
}

const LinkShortener: React.FC<LinkShortenerProps> = ({ links, setLinks }) => {
    const [longUrl, setLongUrl] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res: any = await linksAPI.list();
            if (res && res.success !== false && Array.isArray(res.data)) {
                setLinks(res.data.map((it: any) => ({
                    id: String(it.id ?? ''),
                    shortUrl: String(it.short_url ?? it.slug ?? ''),
                    originalUrl: String(it.long_url ?? it.original_url ?? ''),
                    clicks: Number(it.clicks ?? 0),
                })));
            }
        })();
    }, [setLinks]);

    const handleShorten = async () => {
        if (!longUrl || !longUrl.startsWith('http')) {
            alert('Por favor, insira uma URL válida.');
            return;
        }
        const res: any = await linksAPI.create(longUrl);
        if (res && res.success === false) { alert(res.error || 'Falha ao encurtar'); return; }
        const list: any = await linksAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setLinks(list.data.map((it: any) => ({ id: String(it.id ?? ''), shortUrl: String(it.short_url ?? it.slug ?? ''), originalUrl: String(it.long_url ?? it.original_url ?? ''), clicks: Number(it.clicks ?? 0) })));
        }
        setLongUrl('');
    };

    const handleCopy = (link: ShortenedLink) => {
        navigator.clipboard.writeText(link.shortUrl);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este link?')) return;
        const res: any = await linksAPI.delete(id);
        if (res && res.success === false) { alert(res.error || 'Falha ao excluir'); return; }
        const list: any = await linksAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setLinks(list.data.map((it: any) => ({ id: String(it.id ?? ''), shortUrl: String(it.short_url ?? it.slug ?? ''), originalUrl: String(it.long_url ?? it.original_url ?? ''), clicks: Number(it.clicks ?? 0) })));
        }
    };
    
    const handleLinkClick = async (id: string) => {
        await linksAPI.incrementClick(id);
        const list: any = await linksAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setLinks(list.data.map((it: any) => ({ id: String(it.id ?? ''), shortUrl: String(it.short_url ?? it.slug ?? ''), originalUrl: String(it.long_url ?? it.original_url ?? ''), clicks: Number(it.clicks ?? 0) })));
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))] flex items-center gap-2">
                    <LinkChainIcon className="w-6 h-6"/>
                    Encurtador de Link
                </h1>
            </div>
            <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                 <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                        type="url"
                        placeholder="Cole sua URL longa aqui..."
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        className="flex-grow bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-lg py-3 px-4 text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                    />
                    <button 
                        onClick={handleShorten}
                        className="font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-3 px-6 rounded-lg hover:bg-gold-400"
                    >
                        Encurtar
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))]">Seus Links Recentes</h2>
                {links.map(link => (
                    <div key={link.id} className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick(link.id)} className="font-bold text-[rgb(var(--color-brand-gold))] hover:underline">{link.shortUrl}</a>
                            <p className="text-sm text-[rgb(var(--color-brand-text-dim))] truncate max-w-xs sm:max-w-md">{link.originalUrl}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                <ChartBarIcon className="w-5 h-5"/>
                                <span>{link.clicks} cliques</span>
                            </div>
                            <button
                                onClick={() => handleCopy(link)}
                                className={`font-semibold text-sm py-2 px-4 rounded-md flex items-center gap-2 transition-colors ${
                                    copiedId === link.id
                                    ? 'bg-[rgb(var(--color-success))]/[.20] text-[rgb(var(--color-success))]'
                                    : 'bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] hover:bg-[rgb(var(--color-brand-gray-light))]'
                                }`}
                            >
                                {copiedId === link.id ? <ClipboardDocumentCheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                                {copiedId === link.id ? 'Copiado!' : 'Copiar'}
                            </button>
                             <button onClick={() => handleDelete(link.id)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]" title="Excluir link">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LinkShortener;
import { linksAPI } from '../services/marketplaceAPI';
