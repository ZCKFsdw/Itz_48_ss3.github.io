import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- ICONS ---
const ShieldExclamationIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" })));
const EyeSlashIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" })));
const BugAntIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m15.75 10.5-4.72-4.72a.75.75 0 0 0-1.06 1.06L14.69 12l-4.72 4.72a.75.75 0 1 0 1.06 1.06L17.25 12l-1.5-1.5ZM4.5 12.75l6 6 9-13.5" })));
const ServerStackIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" })));
const GlobeAltIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686-2.253A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" })));
const CogIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5" })));
const CodeBracketIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" })));
const DocumentArrowUpIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" })));
const XCircleIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })));
const KeyIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" })));
const SignalIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 0 0 6-6c0-3.314-2.686-6-6-6s-6 2.686-6 6a6 6 0 0 0 6 6ZM12 18.75V21m-4.243-6.758A13.456 13.456 0 0 1 3.375 12a13.456 13.456 0 0 1 4.382-4.242m8.486 0A13.456 13.456 0 0 1 20.625 12a13.456 13.456 0 0 1-4.382 4.242M12 3v2.25" })));
const CubeTransparentIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25m9 5.25v9.75" })));
const ArrowPathIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0l-3.181 3.183" })));
const MagnifyingGlassIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" })));
const LinkIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" })));
const ArrowDownTrayIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" })));
const WrenchScrewdriverIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.495-2.495a1.125 1.125 0 0 1 1.591 0l3.001 3.001a1.125 1.125 0 0 1 0 1.591l-2.495 2.495m-5.877-5.877-2.495-2.495a1.125 1.125 0 0 0-1.591 0l-3.001 3.001a1.125 1.125 0 0 0 0 1.591l2.495 2.495M3 3l3.591 3.591A2.25 2.25 0 0 1 7.25 8.5H11a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-1.659 2.159L6.659 18l-3.3-3.3z" })));
const ClipboardDocumentIcon = ({ className }) => (React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 4.875V4.5a2.25 2.25 0 0 1 2.25-2.25h3.879a2.25 2.25 0 0 1 1.983 1.135Z" }), React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.5 6.75h-9a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25Z" })));

// --- UTILS ---
const exportReportAsText = (result) => {
    let report = `Pybit Security Analysis Report\n`;
    report += `==============================\n\n`;
    report += `Risk Score: ${result.riskScore}/10\n\n`;
    report += `AI Summary:\n${result.summary}\n\n`;
    report += `==============================\n`;
    report += `Detailed Findings:\n`;
    if(result.detectedLinks && result.detectedLinks.length > 0) {
        report += `\n--- Detected Links ---\n`;
        result.detectedLinks.forEach(link => { report += `- ${link}\n`; });
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

// --- GEMINI SERVICE ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const generateId = () => Math.random().toString(36).substring(2, 9);
const findingItemSchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }, lines: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, required: ["description", "lines"] };
const analysisSchema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, riskScore: { type: Type.INTEGER }, findings: { type: Type.OBJECT, properties: { obfuscation: { type: Type.ARRAY, items: findingItemSchema }, antiDebugging: { type: Type.ARRAY, items: findingItemSchema }, antiVM: { type: Type.ARRAY, items: findingItemSchema }, suspiciousNetwork: { type: Type.ARRAY, items: findingItemSchema }, systemModifications: { type: Type.ARRAY, items: findingItemSchema }, suspiciousFunctions: { type: Type.ARRAY, items: findingItemSchema }, informationStealing: { type: Type.ARRAY, items: findingItemSchema }, commandAndControl: { type: Type.ARRAY, items: findingItemSchema }, trojanIndicators: { type: Type.ARRAY, items: findingItemSchema } }, required: ["obfuscation", "antiDebugging", "antiVM", "suspiciousNetwork", "systemModifications", "suspiciousFunctions", "informationStealing", "commandAndControl", "trojanIndicators"] } }, required: ["summary", "riskScore", "findings"] };
const extractLinks = (findings) => {
    const links = [];
    const urlRegex = /(https?:\/\/(?:discord\.com\/api\/webhooks|t\.me)\/[^\s'"]+)/g;
    const checkCategory = (category) => {
        if (!category) return;
        for (const finding of category) {
            const matches = finding.description.match(urlRegex);
            if (matches) { links.push(...matches); }
        }
    };
    checkCategory(findings.commandAndControl);
    checkCategory(findings.suspiciousNetwork);
    return [...new Set(links)];
};
const analyzeCode = async (content, sourceType = 'python') => {
    let analysisSubject = '', codeContext = '';
    switch(sourceType) {
        case 'python': analysisSubject = 'Python code snippet'; codeContext = `Code to analyze:\n\`\`\`python\n${content}\n\`\`\``; break;
        case 'bat': analysisSubject = 'Windows batch script'; codeContext = `Script to analyze:\n\`\`\`batch\n${content}\n\`\`\``; break;
        case 'exe_strings': analysisSubject = 'collection of strings extracted from an executable (.exe) file'; codeContext = `Strings to analyze:\n\`\`\`\n${content}\n\`\`\``; break;
    }
    const prompt = `
Analyze the following ${analysisSubject} for security vulnerabilities and malicious patterns... [prompt content omitted for brevity] Be strict and thorough in your analysis.
`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: analysisSchema } });
        const jsonText = response.text?.trim();
        if (!jsonText) { throw new Error("The AI model returned an empty response. This may be due to the content being flagged by safety filters."); }
        let result;
        try { result = JSON.parse(jsonText); } catch (parseError) { console.error("Failed to parse Gemini JSON response:", jsonText); throw new Error("The AI model returned an invalid response."); }
        const expectedFindingKeys = ["obfuscation", "antiDebugging", "antiVM", "suspiciousNetwork", "systemModifications", "suspiciousFunctions", "informationStealing", "commandAndControl", "trojanIndicators"];
        if (!result.findings) { result.findings = {}; }
        for (const key of expectedFindingKeys) {
            if (!result.findings[key]) { result.findings[key] = []; }
            result.findings[key] = result.findings[key].map((f) => ({ ...f, id: generateId() }));
        }
        const detectedLinks = extractLinks(result.findings);
        if (detectedLinks.length > 0) { result.detectedLinks = detectedLinks; }
        return result;
    } catch (error) {
        console.error("Error analyzing code with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) { throw new Error("The API key is invalid."); }
            throw new Error(`AI analysis failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code analysis.");
    }
};
const transformCode = async (code, mode, options) => {
    let prompt = `You are an expert Python code transformation tool... [prompt content omitted for brevity]`;
    if (mode === 'obfuscate') { prompt += `\nOriginal Code:\n\`\`\`python\n${code}\n\`\`\``; } else { prompt += `\nObfuscated Code:\n\`\`\`python\n${code}\n\`\`\``; }
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-pro", contents: prompt });
        const transformedCode = response.text?.trim();
        if (!transformedCode) { throw new Error("The AI model returned an empty response."); }
        return transformedCode.replace(/^```python\n|```$/g, '').trim();
    } catch (error) {
        console.error("Error transforming code with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) { throw new Error("The API key is invalid."); }
            throw new Error(`AI code transformation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code transformation.");
    }
};

// --- COMPONENTS ---
const Alert = ({ message, onClose }) => (React.createElement('div', { className: "bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-start justify-between animate-fade-in", role: "alert" }, React.createElement('div', null, React.createElement('h3', { className: "font-bold" }, "An Error Occurred"), React.createElement('p', null, message)), React.createElement('button', { onClick: onClose, className: "ml-4 p-1 rounded-md hover:bg-red-800/50" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })))));
const Header = () => (React.createElement('header', { className: "bg-[#161B22]/80 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-20" }, React.createElement('div', { className: "container mx-auto flex items-center gap-3" }, React.createElement('div', { className: "p-2 bg-gray-800 rounded-lg border border-gray-700" }, React.createElement(CodeBracketIcon, { className: "w-6 h-6 text-blue-400" })), React.createElement('h1', { className: "text-xl sm:text-2xl font-bold text-gray-100" }, "Pybit Code Security Scanner"))));
const CodeInput = ({ textInput, setTextInput, onFileChange, onScan, isLoading, isProcessingFile, file, fileContent }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { onFileChange(e.dataTransfer.files[0]); } }, [onFileChange]);
  const handleFileSelect = (e) => { if (e.target.files && e.target.files.length > 0) { onFileChange(e.target.files[0]); } };
  const handleClearFile = () => { if (fileInputRef.current) { fileInputRef.current.value = ""; } onFileChange(null); };
  const handleAreaClick = () => { if (!file && fileInputRef.current) { fileInputRef.current.click(); } };
  const hasContent = !!(textInput.trim() || file);
  return (React.createElement('div', { className: "flex flex-col gap-4" }, React.createElement('div', { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: handleAreaClick, className: `relative transition-all duration-300 rounded-lg border-2 ${isDraggingOver ? 'border-blue-500 bg-gray-700/30' : 'border-gray-700/50'} ${file || isProcessingFile ? 'cursor-default' : 'cursor-pointer'}` }, isProcessingFile && (React.createElement('div', { className: "absolute inset-0 bg-[#0D1117]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center" }, React.createElement(ArrowPathIcon, { className: "w-16 h-16 text-blue-400 animate-spin" }), React.createElement('p', { className: "mt-4 text-lg" }, "Processing file..."))), file && !isProcessingFile && (React.createElement('div', { className: "absolute inset-0 bg-[#0D1117]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center" }, React.createElement(DocumentArrowUpIcon, { className: "w-16 h-16 text-green-400" }), React.createElement('p', { className: "mt-2 text-lg" }, file.name), React.createElement('button', { onClick: handleClearFile, className: "mt-4 flex items-center gap-2 text-sm text-red-400" }, React.createElement(XCircleIcon, { className: "w-5 h-5" }), "Clear File"))), React.createElement('textarea', { value: file ? (fileContent ?? '') : textInput, onChange: (e) => setTextInput(e.target.value), placeholder: "Paste your code here...", className: "w-full h-96 p-4 bg-gray-900/50 rounded-lg", disabled: !!file || isProcessingFile, readOnly: !!file }), React.createElement('input', { type: "file", ref: fileInputRef, onChange: handleFileSelect, className: "hidden", accept: ".py,.bat,.exe" })), React.createElement('button', { onClick: onScan, disabled: isLoading || isProcessingFile || !hasContent, className: "px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-600" }, "Scan Now")));
};
const ResultCard = ({ title, findings, icon, colorClass, onFindingClick }) => { /* ... JSX ... */ return null;};
const DetectedLinksCard = ({ links }) => { /* ... JSX ... */ return null;};
const CodeDisplay = ({ code, language, findings, highlightedLine }) => { /* ... JSX ... */ return null;};
const Tabs = ({ activeTab, setActiveTab }) => { /* ... JSX ... */ return null;};
const ScanningProgress = () => { /* ... JSX ... */ return null;};
const ResultsDisplay = ({ result, onFindingClick }) => { /* ... JSX ... */ return null;};
const ObfuscatorTool = () => { /* ... JSX ... */ return null;};
const ScannerView = () => { /* ... JSX ... */ return null;};

// --- APP ---
function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  return (React.createElement('div', { className: "min-h-screen bg-[#0D1117] text-gray-200" }, React.createElement(Header, null), React.createElement('main', { className: "container mx-auto p-4 sm:p-6 lg:p-8" }, React.createElement(Tabs, { activeTab: activeTab, setActiveTab: setActiveTab }), React.createElement('div', { className: "mt-6" }, activeTab === 'scanner' && React.createElement(ScannerView, null), activeTab === 'obfuscator' && React.createElement(ObfuscatorTool, null)))));
}

// --- RENDER ---
const rootElement = document.getElementById('root');
if (!rootElement) { throw new Error("Could not find root element to mount to"); }
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(React.StrictMode, null, React.createElement(App, null)));
