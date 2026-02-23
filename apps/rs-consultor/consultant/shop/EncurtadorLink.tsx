import React, { useState } from 'react';
import Card from '../../components/Card';
import { mockShortenedLinks } from '../data';
import { IconLink, IconActive, IconTrendingUp } from '../../components/icons';

const EncurtadorLink: React.FC = () => {
    const [shortenedUrl, setShortenedUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleShorten = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock shortening logic
        const randomString = Math.random().toString(36).substring(2, 7);
        setShortenedUrl(`https://robot.rs/${randomString}`);
    };

    const handleCopy = () => {
        if (!shortenedUrl) return;
        navigator.clipboard.writeText(shortenedUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><IconLink className="mr-3 text-brand-gold"/> Encurtador de Link</h2>
                <form onSubmit={handleShorten} className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input 
                        type="url" 
                        required 
                        placeholder="Cole sua URL longa aqui..."
                        className="flex-1 bg-brand-gray p-3 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"
                    />
                    <button type="submit" className="bg-brand-gold text-brand-dark font-bold px-6 py-3 rounded-md hover:bg-yellow-400 transition-colors">
                        Encurtar
                    </button>
                </form>

                {shortenedUrl && (
                    <div className="mt-6 p-4 bg-brand-gray-light rounded-lg flex items-center justify-between">
                        <span className="font-mono text-lg text-brand-gold">{shortenedUrl}</span>
                        <button 
                            onClick={handleCopy}
                            className={`font-semibold px-4 py-2 rounded-md transition-all duration-300 w-32 text-center flex items-center justify-center ${
                                isCopied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-brand-gray text-white hover:bg-brand-dark'
                            }`}
                        >
                            {isCopied ? <><IconActive size={16} className="mr-2"/> Copiado!</> : 'Copiar'}
                        </button>
                    </div>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Seus Links Recentes</h2>
                <div className="space-y-3">
                    {mockShortenedLinks.map(link => (
                        <div key={link.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-brand-gray-light rounded-lg gap-2">
                            <div>
                                <p className="font-semibold text-brand-gold font-mono break-all">{link.short}</p>
                                <p className="text-sm text-gray-400 truncate break-all">{link.original}</p>
                            </div>
                            <div className="flex items-center space-x-4 flex-shrink-0">
                                <div className="flex items-center space-x-1 text-gray-300">
                                    <IconTrendingUp size={16}/>
                                    <span>{link.clicks} cliques</span>
                                </div>
                                <button className="text-sm bg-brand-gray px-3 py-1.5 rounded-lg hover:bg-brand-dark">Copiar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default EncurtadorLink;