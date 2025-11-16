
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from './icons';

const analysisSteps = [
    "Initializing secure analysis engine...",
    "Parsing code structure...",
    "Scanning for obfuscation patterns...",
    "Checking for anti-debugging techniques...",
    "Analyzing system-level interactions...",
    "Identifying suspicious network patterns...",
    "Screening for known trojan signatures...",
    "Correlating C2 indicators...",
    "Finalizing report...",
];

const ScanningProgress: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prevStep => (prevStep + 1) % analysisSteps.length);
        }, 1500);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const randomIncrement = Math.random() * 5;
                const next = prev + randomIncrement;
                return next < 95 ? next : 95; // Don't let it reach 100% on its own
            });
        }, 300);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0D1117]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-full max-w-md p-8 text-center">
                <MagnifyingGlassIcon className="w-20 h-20 text-blue-500 mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-100 mt-6">Analysis in Progress</h2>
                <p className="text-gray-400 mt-2 h-12 transition-opacity duration-500">
                    {analysisSteps[currentStep]}
                </p>
                
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-6 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-2.5 rounded-full progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-blue-300 mt-2 font-mono">{Math.round(progress)}%</p>
            </div>
        </div>
    );
};

export default ScanningProgress;
