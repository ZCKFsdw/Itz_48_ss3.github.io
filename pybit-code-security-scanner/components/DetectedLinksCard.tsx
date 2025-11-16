import React, { useState } from 'react';
import { LinkIcon } from './icons';

interface DetectedLinksCardProps {
    links: string[];
}

const DetectedLinksCard: React.FC<DetectedLinksCardProps> = ({ links }) => {
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000); // Reset after 2 seconds
    };

    return (
        <div className="bg-orange-900/40 border border-orange-500/50 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-orange-500/30 text-orange-300">
                <LinkIcon className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Detected C2 Links</h3>
                <span className="ml-auto text-sm font-bold bg-orange-800/80 rounded-full px-2 py-0.5">{links.length}</span>
            </div>
            <ul className="space-y-2 text-sm">
                {links.map((link, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-800/60 p-3 rounded-md">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline truncate font-mono"
                        >
                            {link}
                        </a>
                        <button
                            onClick={() => copyToClipboard(link)}
                            className="ml-4 px-2 py-1 text-xs font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                            {copiedLink === link ? 'Copied!' : 'Copy'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DetectedLinksCard;
