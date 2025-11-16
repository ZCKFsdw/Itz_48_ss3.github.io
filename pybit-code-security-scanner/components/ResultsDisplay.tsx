
import React, { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types';
import ResultCard from './ResultCard';
import DetectedLinksCard from './DetectedLinksCard';
import { exportReportAsText } from '../utils';
import { 
    ShieldExclamationIcon, EyeSlashIcon, BugAntIcon, ServerStackIcon, 
    GlobeAltIcon, CogIcon, CodeBracketIcon, KeyIcon, SignalIcon, CubeTransparentIcon,
    ArrowDownTrayIcon
} from './icons';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  onFindingClick: (lineNumber: number) => void;
}

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-animate-in');
        }
      });
    }, options);

    const elements = containerRef.current?.querySelectorAll('.scroll-animate');
    if (elements) {
      elements.forEach(el => observer.observe(el));
    }

    return () => {
      if (elements) {
        elements.forEach(el => observer.unobserve(el));
      }
    };
  }, [options, containerRef]);

  return containerRef;
};

const RiskScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  let color = 'text-green-400';
  let text = 'Low Risk';
  if (score > 3 && score <= 6) {
    color = 'text-yellow-400';
    text = 'Medium Risk';
  } else if (score > 6) {
    color = 'text-red-400';
    text = 'High Risk';
  }

  return (
    <div className="bg-[#161B22] border border-gray-700/50 p-4 rounded-lg flex items-center justify-between h-full">
        <div>
            <h3 className="text-sm text-gray-400">Overall Risk Score</h3>
            <p className={`text-3xl font-bold ${color}`}>{score} / 10</p>
            <p className={`text-sm font-semibold ${color}`}>{text}</p>
        </div>
        <div className="w-24 h-24 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                    className="text-gray-700/50"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className={color}
                    strokeDasharray={`${score * 10}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                />
            </svg>
        </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onFindingClick }) => {
  const containerRef = useIntersectionObserver({ root: null, rootMargin: '0px', threshold: 0.1 });
  
  if (!result) {
    return (
      <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-700/50 rounded-lg">
        <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-2" />
        <h2 className="text-xl font-semibold">Awaiting Analysis</h2>
        <p>Results will be displayed here once the scan is complete.</p>
      </div>
    );
  }

  const findingCategories = [
    { title: 'Information Stealing', findings: result.findings.informationStealing, icon: <KeyIcon className="w-6 h-6" />, color: 'text-red-400' },
    { title: 'Command & Control', findings: result.findings.commandAndControl, icon: <SignalIcon className="w-6 h-6" />, color: 'text-red-400' },
    { title: 'Trojan Indicators', findings: result.findings.trojanIndicators, icon: <CubeTransparentIcon className="w-6 h-6" />, color: 'text-purple-400' },
    { title: 'Obfuscation', findings: result.findings.obfuscation, icon: <EyeSlashIcon className="w-6 h-6" />, color: 'text-yellow-400' },
    { title: 'Suspicious Network Activity', findings: result.findings.suspiciousNetwork, icon: <GlobeAltIcon className="w-6 h-6" />, color: 'text-orange-400' },
    { title: 'Malicious System Modifications', findings: result.findings.systemModifications, icon: <CogIcon className="w-6 h-6" />, color: 'text-orange-400' },
    { title: 'Anti-Debugging', findings: result.findings.antiDebugging, icon: <BugAntIcon className="w-6 h-6" />, color: 'text-yellow-400' },
    { title: 'Anti-VM / Anti-Sandbox', findings: result.findings.antiVM, icon: <ServerStackIcon className="w-6 h-6" />, color: 'text-yellow-400' },
    { title: 'Suspicious Functions', findings: result.findings.suspiciousFunctions, icon: <CodeBracketIcon className="w-6 h-6" />, color: 'text-blue-400' },
  ];

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-100">Analysis Report</h2>
          <button
            onClick={() => exportReportAsText(result)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <ArrowDownTrayIcon className="w-5 h-5"/>
            Export Report
          </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#161B22] border border-gray-700/50 p-4 rounded-lg scroll-animate">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">AI Summary</h3>
          <p className="text-gray-400 leading-relaxed">{result.summary}</p>
        </div>
        <div className="scroll-animate">
          <RiskScoreIndicator score={result.riskScore} />
        </div>
      </div>
      
      {result.detectedLinks && result.detectedLinks.length > 0 && (
          <div className="scroll-animate">
             <DetectedLinksCard links={result.detectedLinks} />
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {findingCategories.map(cat => (
          cat.findings.length > 0 && (
            <div key={cat.title} className="scroll-animate">
              <ResultCard 
                title={cat.title} 
                findings={cat.findings} 
                icon={cat.icon}
                colorClass={cat.color}
                onFindingClick={onFindingClick}
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;