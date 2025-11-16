import React, { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { AnalysisFindings, Finding } from '../types';

interface CodeDisplayProps {
  code: string;
  language: 'python' | 'batch' | 'text';
  findings: AnalysisFindings;
  highlightedLine: number | null;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, language, findings, highlightedLine }) => {
    const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        if (highlightedLine !== null && lineRefs.current[highlightedLine - 1]) {
            lineRefs.current[highlightedLine - 1]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [highlightedLine]);

    const allFindings: Finding[] = Object.values(findings).flat();
    const findingLines = new Set<number>();
    allFindings.forEach(finding => {
        if (finding.lines) {
            finding.lines.forEach(line => findingLines.add(line));
        }
    });

    const getLineProps = (lineNumber: number) => {
        const style: React.CSSProperties = { display: 'block', width: '100%' };
        let className = 'line transition-all duration-300 ';
        
        if (findingLines.has(lineNumber)) {
            className += 'bg-red-900/30 ';
        }
        if (highlightedLine === lineNumber) {
            className += 'bg-blue-800/50 ring-2 ring-blue-400';
        }
        
        return { 
            ref: (el: HTMLSpanElement) => { lineRefs.current[lineNumber - 1] = el },
            style,
            className,
        };
    };

    return (
        <div className="bg-[#161B22] border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 text-sm font-semibold text-gray-300">
                Scanned Content
            </div>
            <div className="max-h-[600px] overflow-auto">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers
                    wrapLines
                    lineProps={getLineProps}
                    customStyle={{
                        backgroundColor: 'transparent',
                        margin: 0,
                        padding: '1rem',
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: '"Fira Code", "Dank Mono", monospace',
                            fontSize: '0.875rem'
                        }
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeDisplay;
