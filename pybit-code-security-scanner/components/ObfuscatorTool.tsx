
import React, { useState, useCallback } from 'react';
import { transformCode } from '../services/geminiService';
import type { ObfuscationOptions } from '../types';
import { ArrowPathIcon, ClipboardDocumentIcon } from './icons';
import Alert from './Alert';

const ObfuscatorTool: React.FC = () => {
    const [mode, setMode] = useState<'obfuscate' | 'deobfuscate'>('obfuscate');
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [options, setOptions] = useState<ObfuscationOptions>({
        method: 'base64',
        layers: 1,
        mangle: true,
        deadCode: 'medium',
        stringOnly: false,
        compress: true,
        antiDebug: false,
        expire: '',
        bindHw: false,
    });

    const handleProcess = useCallback(async () => {
        if (!inputCode.trim()) return;
        setIsLoading(true);
        setError(null);
        setOutputCode('');

        try {
            const result = await transformCode(inputCode, mode, options);
            setOutputCode(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during code transformation.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [inputCode, mode, options]);
    
    const handleCopyToClipboard = () => {
        if (!outputCode) return;
        navigator.clipboard.writeText(outputCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const renderOptions = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-900/40 border border-gray-700/50 rounded-lg">
            {/* Column 1: Encoding */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Encoding</h3>
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-gray-400">Method</label>
                    <select id="method" value={options.method} onChange={e => setOptions({...options, method: e.target.value as ObfuscationOptions['method']})} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>base64</option>
                        <option>hex</option>
                        <option>ascii</option>
                        <option>aes</option>
                        <option>xor</option>
                        <option>rsa</option>
                        <option>mix</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="layers" className="block text-sm font-medium text-gray-400">Layers</label>
                    <input type="number" id="layers" min="1" max="20" value={options.layers} onChange={e => setOptions({...options, layers: parseInt(e.target.value, 10)})} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div className="flex items-center">
                    <input id="compress" type="checkbox" checked={options.compress} onChange={e => setOptions({...options, compress: e.target.checked})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500" />
                    <label htmlFor="compress" className="ml-2 block text-sm text-gray-300">Compress Code</label>
                </div>
            </div>
            
            {/* Column 2: Obfuscation */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Obfuscation</h3>
                <div className="flex items-center">
                    <input id="mangle" type="checkbox" checked={options.mangle} onChange={e => setOptions({...options, mangle: e.target.checked})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500" />
                    <label htmlFor="mangle" className="ml-2 block text-sm text-gray-300">Mangle Names</label>
                </div>
                 <div className="flex items-center">
                    <input id="stringOnly" type="checkbox" checked={options.stringOnly} onChange={e => setOptions({...options, stringOnly: e.target.checked})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500" />
                    <label htmlFor="stringOnly" className="ml-2 block text-sm text-gray-300">String-Only Obfuscation</label>
                </div>
                <div>
                    <label htmlFor="deadCode" className="block text-sm font-medium text-gray-400">Dead Code Insertion</label>
                    <select id="deadCode" value={options.deadCode} onChange={e => setOptions({...options, deadCode: e.target.value as ObfuscationOptions['deadCode']})} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            {/* Column 3: Protection */}
             <div className="space-y-4">
                <h3 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Protection</h3>
                <div className="flex items-center">
                    <input id="antiDebug" type="checkbox" checked={options.antiDebug} onChange={e => setOptions({...options, antiDebug: e.target.checked})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500" />
                    <label htmlFor="antiDebug" className="ml-2 block text-sm text-gray-300">Anti-Debugging</label>
                </div>
                <div className="flex items-center">
                    <input id="bindHw" type="checkbox" checked={options.bindHw} onChange={e => setOptions({...options, bindHw: e.target.checked})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500" />
                    <label htmlFor="bindHw" className="ml-2 block text-sm text-gray-300">Bind to Hardware</label>
                </div>
                <div>
                    <label htmlFor="expire" className="block text-sm font-medium text-gray-400">Expiration Date</label>
                    <input type="date" id="expire" value={options.expire} onChange={e => setOptions({...options, expire: e.target.value})} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
             <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-100">Python Code Obfuscator & Deobfuscator</h2>
                <p className="text-gray-400 max-w-2xl">
                    Transform your Python code with multiple layers of obfuscation or reverse-engineer an obfuscated script to reveal its source.
                </p>
            </div>

            <div className="bg-[#161B22]/70 border border-gray-700/50 p-4 sm:p-6 rounded-xl shadow-2xl space-y-6">
                <div className="flex justify-center bg-gray-800/60 p-1 rounded-lg self-center">
                    <button onClick={() => setMode('obfuscate')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'obfuscate' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Obfuscate</button>
                    <button onClick={() => setMode('deobfuscate')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'deobfuscate' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Deobfuscate</button>
                </div>

                {mode === 'obfuscate' && renderOptions()}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <textarea
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={`Enter your Python code to ${mode} here...`}
                        className="w-full h-96 p-4 bg-gray-900/50 rounded-lg shadow-inner text-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                        spellCheck="false"
                    />
                     <div className="relative">
                        <textarea
                            value={outputCode}
                            readOnly
                            placeholder="Result will appear here..."
                            className="w-full h-96 p-4 bg-gray-900/50 rounded-lg shadow-inner text-gray-300 font-mono text-sm focus:ring-2 focus:ring-gray-600 focus:outline-none resize-y"
                        />
                         {outputCode && (
                            <button
                                onClick={handleCopyToClipboard}
                                className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-sm text-gray-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                                <ClipboardDocumentIcon className="w-4 h-4"/>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>
                </div>
                 
                <div className="flex flex-col items-start gap-4">
                    <button
                        onClick={handleProcess}
                        disabled={isLoading || !inputCode.trim()}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center gap-2 transform hover:-translate-y-1 active:translate-y-0"
                    >
                        {isLoading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin"/>
                                Processing...
                            </>
                        ) : 'Process Code'}
                    </button>
                    {error && <Alert message={error} onClose={() => setError(null)} />}
                </div>

            </div>
        </div>
    );
};

export default ObfuscatorTool;