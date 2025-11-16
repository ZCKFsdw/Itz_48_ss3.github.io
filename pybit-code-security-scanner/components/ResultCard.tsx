
import React from 'react';
import type { Finding } from '../types';

interface ResultCardProps {
  title: string;
  findings: Finding[];
  icon: React.ReactNode;
  colorClass: string;
  onFindingClick: (lineNumber: number) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, findings, icon, colorClass, onFindingClick }) => {
  if (findings.length === 0) {
    return null;
  }

  const handleItemClick = (lines: number[]) => {
    if (lines && lines.length > 0) {
      onFindingClick(lines[0]);
    }
  };

  return (
    <div className="bg-[#161B22] border border-gray-700/50 rounded-lg p-4 shadow-lg h-full">
      <div className={`flex items-center gap-3 mb-3 pb-3 border-b border-gray-700 ${colorClass}`}>
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="ml-auto text-sm font-bold bg-gray-700/80 rounded-full px-2 py-0.5">{findings.length}</span>
      </div>
      <ul className="space-y-2 text-sm max-h-64 overflow-y-auto pr-2">
        {findings.map((finding) => (
          <li 
            key={finding.id} 
            className={`flex flex-col bg-gray-800/60 p-3 rounded-md transition-all duration-200 ${finding.lines && finding.lines.length > 0 ? 'cursor-pointer hover:bg-gray-700/80 hover:ring-2 hover:ring-blue-500/50' : ''}`}
            onClick={() => handleItemClick(finding.lines)}
          >
            <p className="text-gray-300">{finding.description}</p>
            {finding.lines && finding.lines.length > 0 && (
              <p className="text-blue-400 mt-1 font-mono text-xs">
                <span className="font-semibold">Lines:</span> {finding.lines.join(', ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultCard;