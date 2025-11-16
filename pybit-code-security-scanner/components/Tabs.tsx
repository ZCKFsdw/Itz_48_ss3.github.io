
import React from 'react';
import { MagnifyingGlassIcon, WrenchScrewdriverIcon } from './icons';

type ActiveTab = 'scanner' | 'obfuscator';

interface TabsProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold rounded-t-lg border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117] focus:ring-blue-500 ${
            isActive
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
        }`}
    >
        {icon}
        {label}
    </button>
);

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-gray-700/50">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <TabButton
                    label="Scanner"
                    icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                    isActive={activeTab === 'scanner'}
                    onClick={() => setActiveTab('scanner')}
                />
                <TabButton
                    label="Obfuscator"
                    icon={<WrenchScrewdriverIcon className="w-5 h-5" />}
                    isActive={activeTab === 'obfuscator'}
                    onClick={() => setActiveTab('obfuscator')}
                />
            </nav>
        </div>
    );
};

export default Tabs;
