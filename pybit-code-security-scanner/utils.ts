
import type { AnalysisResult } from './types';

export const extractStrings = (buffer: ArrayBuffer, minLength: number = 5): string => {
  const bytes = new Uint8Array(buffer);
  let result = '';
  let currentString = '';

  for (let i = 0; i < bytes.length; i++) {
    const charCode = bytes[i];
    if (
      (charCode >= 32 && charCode <= 126) ||
      charCode === 9 ||
      charCode === 10 ||
      charCode === 13
    ) {
      currentString += String.fromCharCode(charCode);
    } else {
      if (currentString.length >= minLength) {
        result += currentString + '\n';
      }
      currentString = '';
    }
  }
  
  if (currentString.length >= minLength) {
    result += currentString;
  }

  return result.trim();
};

export const exportReportAsText = (result: AnalysisResult) => {
    let report = `Pybit Security Analysis Report\n`;
    report += `==============================\n\n`;
    report += `Risk Score: ${result.riskScore}/10\n\n`;
    report += `AI Summary:\n${result.summary}\n\n`;
    report += `==============================\n`;
    report += `Detailed Findings:\n`;
    
    if(result.detectedLinks && result.detectedLinks.length > 0) {
        report += `\n--- Detected Links ---\n`;
        result.detectedLinks.forEach(link => {
            report += `- ${link}\n`;
        });
    }

    Object.entries(result.findings).forEach(([category, findings]) => {
        if (Array.isArray(findings) && findings.length > 0) {
            const formattedCategory = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            report += `\n--- ${formattedCategory} (${findings.length}) ---\n`;
            findings.forEach(finding => {
                report += `- Description: ${finding.description}\n`;
                if (finding.lines && finding.lines.length > 0) {
                    report += `  Lines: ${finding.lines.join(', ')}\n`;
                }
            });
        }
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pybit-security-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};