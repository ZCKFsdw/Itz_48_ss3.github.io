
import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ScannerView from './components/ScannerView';
import ObfuscatorTool from './components/ObfuscatorTool';

type ActiveTab = 'scanner' | 'obfuscator';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-200">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
            {activeTab === 'scanner' && <ScannerView />}
            {activeTab === 'obfuscator' && <ObfuscatorTool />}
        </div>
      </main>
    </div>
  );
}

export default App;
