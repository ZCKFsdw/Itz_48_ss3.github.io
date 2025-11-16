
import React from 'react';
import { CodeBracketIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-[#161B22]/80 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-20">
            <div className="container mx-auto flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                    <CodeBracketIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                    Pybit Code Security Scanner
                </h1>
            </div>
        </header>
    );
};

export default Header;