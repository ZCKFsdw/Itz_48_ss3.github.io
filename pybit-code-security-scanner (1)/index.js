
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- API Key Check ---
const API_KEY = process.env.API_KEY;

// --- ICONS ---
const IconWrapper = ({ children, className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className }, children);
const ShieldExclamationIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" }));
const EyeSlashIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" }));
const GlobeAltIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686-2.253A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" }));
const DocumentArrowUpIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" }));
const XCircleIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" }));
const KeyIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" }));
const SignalIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 0 0 6-6c0-3.314-2.686-6-6-6s-6 2.686-6 6a6 6 0 0 0 6 6ZM12 18.75V21m-4.243-6.758A13.456 13.456 0 0 1 3.375 12a13.456 13.456 0 0 1 4.382-4.242m8.486 0A13.456 13.456 0 0 1 20.625 12a13.456 13.456 0 0 1-4.382 4.242M12 3v2.25" }));
const CubeTransparentIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25m9 5.25v9.75" }));
const ArrowPathIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 0 0-2.25-2.25h-4.5a2.25 2.25 0 0 0-2.25 2.25v4.992m2.25 0h4.5" }));
const MagnifyingGlassIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" }));
const LinkIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" }));
const ArrowDownTrayIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" }));
const WrenchScrewdriverIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8.25V6m0 2.25h.008v.008H12V8.25Zm0 6V18m0-3.75h.008v.008H12v-.008Zm0-6h.008v.008H12V6Zm-2.25-3h4.5v15h-4.5V3Zm-3.75 3.75h12V3h-12v3.75Z" }));
const ClipboardDocumentIcon = ({ className = "w-6 h-6" }) => React.createElement(IconWrapper, { className }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 3.375-3.375-3.375m0 0A9.037 9.037 0 0 1 12 5.25c-1.518 0-2.94.463-4.125 1.254" }));

// --- GEMINI SERVICE ---
let ai;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const analyzeCode = async (code, sourceType, onProgress) => {
    if (!ai) throw new Error("API Key not found. Please ensure it's configured correctly in your environment.");

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A brief, one-sentence summary of the code's primary purpose." },
        obfuscation: {
          type: Type.OBJECT,
          description: "Analysis of code obfuscation techniques.",
          properties: {
            isObfuscated: { type: Type.BOOLEAN },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  technique: { type: Type.STRING, description: "e.g., Base64 Encoding, Hex Encoding, Name Mangling" },
                  line: { type: Type.INTEGER },
                  evidence: { type: Type.STRING, description: "The specific code snippet that is obfuscated." },
                  details: { type: Type.STRING, description: "Explanation of why this is considered obfuscation." }
                }
              }
            }
          }
        },
        malware: {
            type: Type.OBJECT,
            properties: {
                isMalware: { type: Type.BOOLEAN },
                findings: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            signature: { type: Type.STRING, description: "e.g., Ransomware, Keylogger, Spyware" },
                            line: { type: Type.INTEGER },
                            evidence: { type: Type.STRING },
                            details: { type: Type.STRING, description: "Explanation of the malicious behavior." }
                        }
                    }
                }
            }
        },
        network: {
            type: Type.OBJECT,
            properties: {
                hasNetworkActivity: { type: Type.BOOLEAN },
                findings: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            activity: { type: Type.STRING, description: "e.g., HTTP Request, Socket Connection, DNS Query" },
                            line: { type: Type.INTEGER },
                            destination: { type: Type.STRING, description: "IP address or domain name." },
                            details: { type: Type.STRING }
                        }
                    }
                }
            }
        },
        informationStealing: {
            type: Type.OBJECT,
            properties: {
                findings: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            dataType: { type: Type.STRING, description: "e.g., Discord Token, Browser Passwords, Cookies, WiFi Keys" },
                            line: { type: Type.INTEGER },
                            evidence: { type: Type.STRING },
                            details: { type: Type.STRING, description: "How the data is being accessed or exfiltrated." }
                        }
                    }
                }
            }
        },
        commandAndControl: {
            type: Type.OBJECT,
            properties: {
                findings: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            type: { type: Type.STRING, description: "e.g., Discord Webhook, Telegram Bot, Hardcoded IP" },
                            line: { type: Type.INTEGER },
                            evidence: { type: Type.STRING, description: "The webhook URL, bot token, or IP address." },
                            details: { type: Type.STRING }
                        }
                    }
                }
            }
        },
        trojanIndicators: {
            type: Type.OBJECT,
            properties: {
                findings: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            indicator: { type: Type.STRING, description: "e.g., XWorm RAT Pattern, Persistence Mechanism, Suspicious Process Injection" },
                            line: { type: Type.INTEGER },
                            evidence: { type: Type.STRING },
                            details: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    };
    
    const contextPrompts = {
      python: "You are an expert Python malware analyst. Your goal is to identify security risks, obfuscation, and malicious patterns. Pay close attention to data exfiltration (Discord tokens, passwords), C2 channels (webhooks, IPs), and common malware families like XWorm RAT.",
      batch: "You are an expert Batch script security analyst. Focus on detecting malicious commands, file system manipulation, registry changes, network connections, and techniques used to download and execute secondary payloads.",
      exe: "You are an expert malware analyst reviewing strings extracted from an executable file. Identify hardcoded IP addresses, domains, user agents, webhook URLs, file paths, registry keys, and any other suspicious indicators that could reveal the binary's functionality, such as C2 communication, information stealing, or persistence mechanisms."
    };

    const CHUNK_SIZE = 15000;
    const chunks = [];
    
    if (code.length > CHUNK_SIZE) {
        let currentChunk = '';
        let lineOffset = 0;
        const codeLines = code.split('\n');

        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            if (currentChunk.length + line.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
                chunks.push({ content: currentChunk, startLine: lineOffset });
                lineOffset += currentChunk.split('\n').length; // Correct line offset
                currentChunk = '';
            }
            currentChunk += line + '\n';
        }
        if (currentChunk.length > 0) {
            chunks.push({ content: currentChunk, startLine: lineOffset });
        }
    } else {
        chunks.push({ content: code, startLine: 0 });
    }

    let aggregatedFindings = [];
    let aggregatedLinks = [];
    let summaries = [];

    const extractLinks = (findings) => {
        const links = [];
        const webhookRegex = /https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/g;
        const telegramRegex = /https:\/\/api\.telegram\.org\/bot[0-9]+:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_]+/g;
        if (Array.isArray(findings)) {
            findings.forEach(finding => {
                const evidence = finding.evidence || '';
                const details = finding.details || '';
                [...evidence.matchAll(webhookRegex), ...details.matchAll(webhookRegex)].forEach(match => links.push({ type: 'Discord Webhook', url: match[0] }));
                [...evidence.matchAll(telegramRegex), ...details.matchAll(telegramRegex)].forEach(match => links.push({ type: 'Telegram Bot', url: match[0] }));
            });
        }
        return links;
    };

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        onProgress({ status: `Analyzing chunk ${i + 1} of ${chunks.length}...`, progress: (i / chunks.length) * 100 });
        
        const prompt = `${contextPrompts[sourceType]}\n\nAnalyze the following code (lines are relative to this chunk):\n\`\`\`${sourceType}\n${chunk.content}\`\`\`\n\nProvide a detailed analysis in JSON format based on the schema.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json", responseSchema: schema },
            });

            if (!response || !response.text) {
                console.warn(`Chunk ${i+1} returned an empty response, possibly due to safety filters.`);
                continue;
            }

            const result = JSON.parse(response.text);
            if(result.summary) summaries.push(result.summary);

            const allChunkFindings = [
                ...(result.obfuscation?.findings || []).map(f => ({ ...f, category: 'Obfuscation' })),
                ...(result.malware?.findings || []).map(f => ({ ...f, category: 'Malware' })),
                ...(result.network?.findings || []).map(f => ({ ...f, category: 'Network' })),
                ...(result.informationStealing?.findings || []).map(f => ({ ...f, category: 'Information Stealing' })),
                ...(result.commandAndControl?.findings || []).map(f => ({ ...f, category: 'Command & Control' })),
                ...(result.trojanIndicators?.findings || []).map(f => ({ ...f, category: 'Trojan Indicators' })),
            ];

            allChunkFindings.forEach(finding => {
                const adjustedFinding = {
                    ...finding,
                    line: (finding.line || 1) + chunk.startLine,
                    id: crypto.randomUUID(),
                };
                aggregatedFindings.push(adjustedFinding);
            });
            
            aggregatedLinks.push(...extractLinks(result.commandAndControl?.findings));
            aggregatedLinks.push(...extractLinks(result.network?.findings));

        } catch (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            const message = error.message || 'An unknown error occurred';
            if (message.includes("API key not valid")) {
                 throw new Error("Invalid API Key. Please check your configuration.");
            }
             if (message.toLowerCase().includes("safety")) {
                throw new Error(`Analysis of chunk ${i + 1} was blocked by content safety filters.`);
            }
            throw new Error(`An error occurred during analysis of chunk ${i + 1}.`);
        }
    }
    
    onProgress({ status: "Compiling final report...", progress: 95 });

    const finalSummary = summaries.length > 0 ? summaries.join('\n') : "Analysis complete. Review the detailed findings below.";
    const uniqueLinks = [...new Set(aggregatedLinks.map(l => JSON.stringify(l)))].map(s => JSON.parse(s));

    return {
        summary: finalSummary,
        findings: aggregatedFindings,
        detectedLinks: uniqueLinks,
    };
};

const transformCode = async (code, options) => {
    if (!ai) throw new Error("API Key not found.");
    
    const OBFUSCATION_SIZE_LIMIT = 50000;
    if (options.mode === 'obfuscate' && code.length > OBFUSCATION_SIZE_LIMIT) {
        throw new Error(`Code is too large (${code.length} chars) for reliable obfuscation. The limit is ${OBFUSCATION_SIZE_LIMIT} chars.`);
    }

    let instruction = '';
    if (options.mode === 'obfuscate') {
        const steps = [];
        if (options.mangle) steps.push("- Apply name mangling to all variables, functions, and classes.");
        if (options.deadCode) steps.push("- Insert plausible but non-functional dead code snippets throughout the code.");
        if (options.stringOnly) steps.push("- Obfuscate all string literals using base64 encoding.");
        steps.push(`- Apply ${options.layers} layer(s) of '${options.method}' encoding to the entire script. For 'aes', generate and embed a new random key. For 'mix', randomly choose one method per layer from 'base64', 'hex', 'aes', 'xor', or 'rsa'.`);
        instruction = `You are a Python code obfuscation expert. Your task is to apply a series of transformations to the given Python code based on the user's request. Perform all of the following requested transformations in a single pass:\n${steps.join("\n")}`;
    } else {
        instruction = 'You are an expert at deobfuscating Python code. The following code is heavily obfuscated. Your task is to recursively analyze and decode all layers of obfuscation (like base64, hex, AES, zlib compression, etc.) until you reveal the original, human-readable source code.';
    }

    const prompt = `${instruction}\n\nOriginal Code:\n\`\`\`python\n${code}\n\`\`\`\n\nReturn *only* the resulting Python code inside a single code block. Do not add any explanations or introductory text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        if (!response || !response.text) {
            throw new Error("Received an empty response from the API. The content may have been blocked by safety filters.");
        }
        const text = response.text;
        const codeBlockMatch = text.match(/```(?:python\n)?([\s\S]*?)```/);
        return codeBlockMatch && codeBlockMatch[1] ? codeBlockMatch[1].trim() : text.trim();
    } catch (error) {
        console.error("Gemini Transformation Error:", error);
        const message = error.message || 'An unknown error occurred';
        if (message.toLowerCase().includes("safety")) {
            throw new Error("Code transformation was blocked by content safety filters.");
        }
        if (message.includes("API key not valid")) {
            throw new Error("Invalid API Key. Please check your configuration.");
        }
        throw new Error(`An error occurred during code transformation.`);
    }
};

// --- UTILITIES ---
const exportReportAsText = (analysisResult, code) => {
    let report = `Pybit Code Security Scan Report\n`;
    report += `Generated: ${new Date().toUTCString()}\n`;
    report += `==================================\n\n`;
    report += `Summary:\n${analysisResult.summary}\n\n`;

    if (analysisResult.detectedLinks && analysisResult.detectedLinks.length > 0) {
        report += `Detected Links:\n`;
        analysisResult.detectedLinks.forEach(link => {
            report += `- ${link.type}: ${link.url}\n`;
        });
        report += '\n';
    }
    
    report += `Detailed Findings (${analysisResult.findings.length}):\n`;
    report += `----------------------------------\n`;
    analysisResult.findings.forEach(finding => {
        report += `[${finding.category.toUpperCase()}] - Line ${finding.line}\n`;
        report += `  - Type: ${finding.technique || finding.signature || finding.activity || finding.dataType || finding.indicator}\n`;
        report += `  - Details: ${finding.details}\n`;
        report += `  - Evidence: ${finding.evidence}\n\n`;
    });
    
    report += `==================================\n`;
    report += `Scanned Code:\n`;
    report += `----------------------------------\n`;
    report += code;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pybit-scan-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

// --- UI COMPONENTS ---
const Alert = ({ message, onClose }) => {
    if (!message) return null;
    return React.createElement('div', { className: "fixed top-5 right-5 bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center" },
        React.createElement('span', { className: "block sm:inline mr-4" }, message),
        React.createElement('button', { onClick: onClose, className: "p-1 rounded-full hover:bg-red-700 focus:outline-none" },
            React.createElement(XCircleIcon, { className: "w-5 h-5" })
        )
    );
};

const Header = () => {
    return React.createElement('header', { className: "p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40" },
        React.createElement('div', { className: "container mx-auto flex items-center" },
            React.createElement(ShieldExclamationIcon, { className: "w-8 h-8 mr-3 text-cyan-400" }),
            React.createElement('h1', { className: "text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text" }, "Pybit Security Scanner")
        )
    );
};

const CodeInput = ({ onScan, isLoading, isProcessingFile }) => {
    const [code, setCode] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const dropzoneRef = useRef(null);

    const handleFileChange = (selectedFile) => {
        if (selectedFile) {
            const sourceType = selectedFile.name.endsWith('.bat') ? 'batch' : selectedFile.name.endsWith('.exe') ? 'exe' : 'python';
            setFile(selectedFile);
            onScan({ file: selectedFile, code: null, sourceType });
        }
    };

    const handleClearFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
        onScan({ file: null, code: '', sourceType: 'python' });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneRef.current.classList.remove('border-cyan-400');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneRef.current.classList.add('border-cyan-400');
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dropzoneRef.current.contains(e.relatedTarget)) {
        dropzoneRef.current.classList.remove('border-cyan-400');
      }
    };

    return React.createElement('div', { className: "p-4 md:p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg" },
        React.createElement('div', { ref: dropzoneRef, onDrop: handleDrop, onDragOver: handleDragOver, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, className: "relative border-2 border-dashed border-gray-600 rounded-lg p-4 transition-colors" },
            React.createElement('textarea', {
                value: code,
                onChange: (e) => setCode(e.target.value),
                placeholder: "Paste your code here, or drag & drop a .py, .bat, or .exe file...",
                className: "w-full h-48 bg-gray-900 text-gray-300 p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono resize-none",
                disabled: isLoading || isProcessingFile || file
            }),
            isProcessingFile && React.createElement('div', {className: "absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-lg"}, 
                 React.createElement(ArrowPathIcon, {className: "w-8 h-8 animate-spin text-cyan-400 mr-2"}),
                 React.createElement('span', {className: "text-lg text-gray-300"}, "Processing file...")
            ),
            file && React.createElement('div', { className: "absolute inset-0 bg-gray-900/90 flex items-center justify-center rounded-lg text-lg" },
                React.createElement(DocumentArrowUpIcon, { className: "w-6 h-6 mr-3 text-green-400" }),
                React.createElement('span', { className: "font-semibold mr-4" }, file.name),
                React.createElement('button', { onClick: handleClearFile, className: "p-1 rounded-full hover:bg-gray-700" },
                    React.createElement(XCircleIcon, { className: "w-6 h-6 text-red-400" })
                )
            )
        ),
        React.createElement('div', { className: "mt-4 flex flex-col sm:flex-row items-center gap-4" },
            React.createElement('button', {
                onClick: () => onScan({ code: code, file: null, sourceType: 'python' }),
                disabled: isLoading || isProcessingFile,
                className: "w-full sm:w-auto flex-grow px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform transform active:scale-95"
            }, "Scan Now"),
            React.createElement('input', {
                type: "file",
                ref: fileInputRef,
                onChange: (e) => handleFileChange(e.target.files[0]),
                className: "hidden",
                accept: ".py,.bat,.exe"
            }),
            React.createElement('button', {
                onClick: () => fileInputRef.current.click(),
                disabled: isLoading || isProcessingFile,
                className: "w-full sm:w-auto px-6 py-3 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 disabled:bg-gray-500"
            }, "Or Upload a File")
        )
    );
};

const ResultCard = ({ icon, title, findings = [], onFindingClick }) => {
    return React.createElement('div', { className: "bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 scroll-animate" },
        React.createElement('h3', { className: "text-lg font-semibold mb-3 flex items-center" },
            icon,
            React.createElement('span', { className: "ml-2" }, `${title} (${findings.length})`)
        ),
        findings.length > 0 ?
            React.createElement('ul', { className: "space-y-3" },
                findings.map(finding => React.createElement('li', {
                    key: finding.id,
                    onClick: () => onFindingClick(finding.line),
                    className: "bg-gray-800/50 p-3 rounded-md cursor-pointer hover:bg-gray-700/50 transition-colors"
                },
                    React.createElement('p', { className: "font-mono text-sm text-red-400" }, `Line ${finding.line}: ${finding.technique || finding.signature || finding.activity || finding.dataType || finding.indicator}`),
                    React.createElement('p', { className: "text-gray-400 text-sm mt-1" }, finding.details),
                    React.createElement('p', { className: "font-mono text-xs text-gray-500 mt-2 bg-gray-900 p-2 rounded" }, `Evidence: ${finding.evidence}`)
                ))
            ) :
            React.createElement('p', { className: "text-gray-500" }, `No ${title.toLowerCase()} findings detected.`)
    );
};

const DetectedLinksCard = ({ links = [] }) => {
    const [copiedUrl, setCopiedUrl] = useState(null);

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        });
    };

    if (links.length === 0) return null;

    return React.createElement('div', { className: "bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6 animate-fade-in" },
        React.createElement('h3', { className: "text-lg font-semibold mb-3 flex items-center text-yellow-300" },
            React.createElement(LinkIcon, { className: "w-5 h-5 mr-2" }),
            `Detected Links (${links.length})`
        ),
        React.createElement('ul', { className: "space-y-2" },
            links.map((link, index) => React.createElement('li', { key: index, className: "flex items-center justify-between bg-gray-800/50 p-2 rounded-md" },
                React.createElement('div', { className: "flex items-center" },
                    React.createElement('span', { className: "text-sm font-semibold text-yellow-400 mr-3" }, link.type),
                    React.createElement('code', { className: "text-xs text-gray-300" }, link.url)
                ),
                React.createElement('button', {
                    onClick: () => handleCopy(link.url),
                    className: "text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                }, copiedUrl === link.url ? 'Copied!' : 'Copy')
            ))
        )
    );
};

const CodeDisplay = ({ code, highlightedLine, language, codeDisplayRef }) => {
    const lineRefs = useRef({});

    useEffect(() => {
        if (highlightedLine && lineRefs.current[highlightedLine]) {
            lineRefs.current[highlightedLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedLine]);

    return React.createElement('div', { ref: codeDisplayRef, className: "relative bg-gray-900 border border-gray-700/50 rounded-lg overflow-hidden" },
        React.createElement(SyntaxHighlighter, {
            language: language,
            style: vscDarkPlus,
            showLineNumbers: true,
            wrapLines: true,
            lineProps: (lineNumber) => {
                const isHighlighted = lineNumber === highlightedLine;
                return {
                    ref: (el) => lineRefs.current[lineNumber] = el,
                    style: { display: 'block', width: '100%', backgroundColor: isHighlighted ? 'rgba(59, 130, 246, 0.2)' : undefined },
                };
            },
            className: "text-sm"
        }, code)
    );
};

const ResultsDisplay = ({ analysisResult, code, language, onFindingClick, onExport, codeDisplayRef, highlightedLine }) => {
     useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-animate-in');
                }
            });
        }, { threshold: 0.1 });

        const targets = document.querySelectorAll('.scroll-animate');
        targets.forEach(target => observer.observe(target));

        return () => targets.forEach(target => observer.unobserve(target));
    }, [analysisResult]);

    const findingsByCategory = (category) => analysisResult.findings.filter(f => f.category === category);

    return React.createElement('div', { className: "mt-8 space-y-6 animate-fade-in" },
        React.createElement('div', { className: "flex justify-between items-center" },
            React.createElement('h2', { className: "text-2xl font-bold" }, "Analysis Report"),
            React.createElement('button', { onClick: onExport, className: "flex items-center px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600" },
                React.createElement(ArrowDownTrayIcon, { className: "w-5 h-5 mr-2" }),
                "Export Report"
            )
        ),
        React.createElement('p', { className: "text-gray-400" }, analysisResult.summary),
        React.createElement(DetectedLinksCard, { links: analysisResult.detectedLinks }),
        React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
            React.createElement('div', { className: "lg:col-span-1 space-y-6" },
                React.createElement(ResultCard, { icon: React.createElement(EyeSlashIcon, { className: "w-5 h-5 text-yellow-400" }), title: "Obfuscation", findings: findingsByCategory('Obfuscation'), onFindingClick: onFindingClick }),
                React.createElement(ResultCard, { icon: React.createElement(KeyIcon, { className: "w-5 h-5 text-orange-400" }), title: "Information Stealing", findings: findingsByCategory('Information Stealing'), onFindingClick: onFindingClick }),
                React.createElement(ResultCard, { icon: React.createElement(SignalIcon, { className: "w-5 h-5 text-red-400" }), title: "Command & Control", findings: findingsByCategory('Command & Control'), onFindingClick: onFindingClick }),
                React.createElement(ResultCard, { icon: React.createElement(GlobeAltIcon, { className: "w-5 h-5 text-blue-400" }), title: "Network", findings: findingsByCategory('Network'), onFindingClick: onFindingClick }),
                React.createElement(ResultCard, { icon: React.createElement(CubeTransparentIcon, { className: "w-5 h-5 text-purple-400" }), title: "Trojan Indicators", findings: findingsByCategory('Trojan Indicators'), onFindingClick: onFindingClick })
            ),
            React.createElement('div', { className: "lg:col-span-1 sticky top-24 self-start" },
                React.createElement(CodeDisplay, { code: code, highlightedLine: highlightedLine, language: language, codeDisplayRef: codeDisplayRef })
            )
        )
    );
};

const ScanningProgress = ({ status, progress }) => {
    return React.createElement('div', { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white" },
        React.createElement(MagnifyingGlassIcon, { className: "w-12 h-12 mb-4 text-cyan-400 animate-pulse" }),
        React.createElement('p', { className: "text-xl font-semibold mb-4" }, status),
        React.createElement('div', { className: "w-1/2 max-w-md bg-gray-700 rounded-full h-2.5" },
            React.createElement('div', { className: "bg-cyan-500 h-2.5 rounded-full progress-bar-fill", style: { width: `${progress}%` } })
        )
    );
};

const Tabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'Scanner', icon: MagnifyingGlassIcon },
        { name: 'Obfuscator', icon: WrenchScrewdriverIcon },
    ];
    return React.createElement('div', { className: "mb-6 border-b border-gray-700" },
        React.createElement('nav', { className: "-mb-px flex space-x-8" },
            tabs.map(tab => React.createElement('button', {
                key: tab.name,
                onClick: () => setActiveTab(tab.name),
                className: `whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.name ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`
            },
                React.createElement(tab.icon, { className: "w-5 h-5 mr-2" }),
                tab.name
            ))
        )
    );
};

const ScannerView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [scannedContent, setScannedContent] = useState({ code: '', language: 'python' });
    const [highlightedLine, setHighlightedLine] = useState(null);
    const [scanStatus, setScanStatus] = useState('');
    const [scanProgress, setScanProgress] = useState(0);
    const codeDisplayRef = useRef(null);
    const workerRef = useRef(null);

    useEffect(() => {
        const workerCode = `
          const extractStrings = (arrayBuffer) => {
              const view = new DataView(arrayBuffer);
              let strings = '';
              let currentString = '';
              for (let i = 0; i < view.byteLength; i++) {
                  const byte = view.getUint8(i);
                  if (byte >= 32 && byte <= 126) {
                      currentString += String.fromCharCode(byte);
                  } else {
                      if (currentString.length > 4) { // Minimum string length
                          strings += currentString + '\\n';
                      }
                      currentString = '';
                  }
              }
              if (currentString.length > 4) {
                  strings += currentString + '\\n';
              }
              return strings;
          };

          self.onmessage = (e) => {
              const file = e.data.file;
              const reader = new FileReader();
              const isBinary = file.name.endsWith('.exe');

              reader.onload = (event) => {
                  try {
                      const content = isBinary ? extractStrings(event.target.result) : event.target.result;
                      const type = isBinary ? 'exe' : (file.name.endsWith('.bat') ? 'batch' : 'python');
                      self.postMessage({ content, type });
                  } catch (err) {
                      self.postMessage({ error: err.message });
                  }
              };
              reader.onerror = () => {
                  self.postMessage({ error: 'Failed to read file.' });
              };
              
              if (isBinary) {
                reader.readAsArrayBuffer(file);
              } else {
                reader.readAsText(file);
              }
          };
        `;
        workerRef.current = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));

        workerRef.current.onmessage = (e) => {
            setIsProcessingFile(false);
            if (e.data.error) {
                setError(`File Read Error: ${e.data.error}`);
            } else {
                handleScan({ code: e.data.content, sourceType: e.data.type });
            }
        };

        return () => workerRef.current.terminate();
    }, []);

    const handleFileChange = useCallback((file) => {
        setAnalysisResult(null);
        setError(null);
        if (!file) {
            setScannedContent({ code: '', language: 'python' });
            return;
        }

        const MAX_SIZE = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setError('File size exceeds 25MB limit.');
            return;
        }
        
        setIsProcessingFile(true);
        workerRef.current.postMessage({ file });
    }, []);

    const handleScan = useCallback(async ({ code, file, sourceType: fileSourceType }) => {
        if (file) {
            handleFileChange(file);
            return;
        }

        if (!code || code.trim() === '') {
            setError("Please provide code or a file to scan.");
            return;
        }

        setAnalysisResult(null);
        setError(null);
        setIsLoading(true);
        setScanProgress(0);
        setScanStatus("Initializing scanner...");
        
        try {
            const sourceType = fileSourceType || 'python';
            
            const onProgress = ({ status, progress }) => {
                setScanStatus(status);
                setScanProgress(progress);
            };

            const result = await analyzeCode(code, sourceType, onProgress);
            setAnalysisResult(result);
            setScannedContent({ code: code, language: sourceType === 'batch' ? 'batch' : 'python' });
        } catch (err) {
            setError(err.message);
        } finally {
            setScanProgress(100);
            setScanStatus('Analysis complete.');
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [handleFileChange]);

    const handleFindingClick = (line) => {
        setHighlightedLine(line);
    };

    return React.createElement(React.Fragment, null,
        isLoading && React.createElement(ScanningProgress, { status: scanStatus, progress: scanProgress }),
        React.createElement(Alert, { message: error, onClose: () => setError(null) }),
        React.createElement(CodeInput, { onScan: handleScan, isLoading: isLoading, isProcessingFile: isProcessingFile }),
        analysisResult && React.createElement(ResultsDisplay, {
            analysisResult: analysisResult,
            code: scannedContent.code,
            language: scannedContent.language,
            onFindingClick: handleFindingClick,
            onExport: () => exportReportAsText(analysisResult, scannedContent.code),
            codeDisplayRef: codeDisplayRef,
            highlightedLine: highlightedLine
        })
    );
};

const ObfuscatorTool = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [options, setOptions] = useState({
        mode: 'obfuscate', // 'obfuscate' or 'deobfuscate'
        mangle: true,
        deadCode: true,
        stringOnly: false,
        method: 'mix',
        layers: 3,
    });
    const [copied, setCopied] = useState(false);

    const handleOptionChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOptions(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleModeChange = (mode) => {
        setOptions(prev => ({...prev, mode}));
        setResult('');
    };

    const handleTransform = async () => {
        setError(null);
        setResult('');
        if (!code.trim()) {
            setError("Please enter code to transform.");
            return;
        }
        setIsLoading(true);

        const totalSteps = options.mode === 'obfuscate' ? 2 + options.layers : 1;
        let currentStep = 0;
        
        const updateProgress = (stepStatus) => {
            currentStep++;
            setProgress(Math.round((currentStep / totalSteps) * 100));
            setStatus(stepStatus);
        };
        
        // Use a simulated progress bar for the single request
        setStatus(options.mode === 'obfuscate' ? 'Applying transformations...' : 'Deobfuscating code...');
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(p => (p < 90 ? p + 10 : p));
        }, 500);


        try {
            const transformedCode = await transformCode(code, options);
            setResult(transformedCode);
        } catch (err) {
            setError(err.message);
        } finally {
            clearInterval(interval);
            setProgress(100);
            setStatus('Transformation complete.');
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return React.createElement('div', { className: "space-y-6" },
        isLoading && React.createElement(ScanningProgress, { status: status, progress: progress }),
        React.createElement(Alert, { message: error, onClose: () => setError(null) }),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement('div', null,
                React.createElement('h3', { className: "text-lg font-semibold mb-2" }, "Input Code"),
                React.createElement('textarea', {
                    value: code,
                    onChange: (e) => setCode(e.target.value),
                    placeholder: "Paste your Python code here...",
                    className: "w-full h-72 bg-gray-900 text-gray-300 p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono resize-y border border-gray-700"
                })
            ),
            React.createElement('div', null,
                 React.createElement('div', { className: "flex justify-between items-center mb-2" },
                    React.createElement('h3', { className: "text-lg font-semibold" }, "Result"),
                    result && React.createElement('button', { onClick: handleCopy, className: "flex items-center px-3 py-1 bg-gray-700 text-sm rounded hover:bg-gray-600" }, 
                        React.createElement(ClipboardDocumentIcon, {className: "w-4 h-4 mr-2"}),
                        copied ? 'Copied!' : 'Copy'
                    )
                ),
                React.createElement('div', { className: "w-full h-72 bg-gray-900 text-gray-300 p-3 rounded-md font-mono overflow-auto border border-gray-700" },
                    React.createElement('pre', null, React.createElement('code', null, result || "Transformation result will appear here..."))
                )
            )
        ),
        React.createElement('div', { className: "p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg" },
            React.createElement('div', { className: "flex items-center space-x-4 mb-4" },
                 React.createElement('span', { className: "font-semibold" }, "Mode:"),
                 React.createElement('button', { onClick: () => handleModeChange('obfuscate'), className: `px-4 py-2 rounded ${options.mode === 'obfuscate' ? 'bg-cyan-600 text-white' : 'bg-gray-700'}` }, "Obfuscate"),
                 React.createElement('button', { onClick: () => handleModeChange('deobfuscate'), className: `px-4 py-2 rounded ${options.mode === 'deobfuscate' ? 'bg-cyan-600 text-white' : 'bg-gray-700'}` }, "Deobfuscate")
            ),
            options.mode === 'obfuscate' && React.createElement('div', { className: "space-y-4 animate-fade-in" },
                React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                    React.createElement('label', { className: "flex items-center space-x-2" }, React.createElement('input', { type: "checkbox", name: "mangle", checked: options.mangle, onChange: handleOptionChange, className: "form-checkbox h-5 w-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500" }), React.createElement('span', null, "Mangle Names")),
                    React.createElement('label', { className: "flex items-center space-x-2" }, React.createElement('input', { type: "checkbox", name: "deadCode", checked: options.deadCode, onChange: handleOptionChange, className: "form-checkbox h-5 w-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500" }), React.createElement('span', null, "Insert Dead Code")),
                    React.createElement('label', { className: "flex items-center space-x-2" }, React.createElement('input', { type: "checkbox", name: "stringOnly", checked: options.stringOnly, onChange: handleOptionChange, className: "form-checkbox h-5 w-5 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500" }), React.createElement('span', null, "String-Only Obfuscation")),
                ),
                React.createElement('div', { className: "flex items-center space-x-4" },
                    React.createElement('label', { htmlFor: "method" }, "Method:"),
                    React.createElement('select', { name: "method", value: options.method, onChange: handleOptionChange, className: "bg-gray-800 border border-gray-600 rounded px-2 py-1" },
                        React.createElement('option', { value: "mix" }, "Mix"),
                        React.createElement('option', { value: "base64" }, "Base64"),
                        React.createElement('option', { value: "hex" }, "Hex"),
                        React.createElement('option', { value: "aes" }, "AES"),
                        React.createElement('option', { value: "xor" }, "XOR"),
                        React.createElement('option', { value: "rsa" }, "RSA")
                    ),
                    React.createElement('label', { htmlFor: "layers" }, "Layers:"),
                    React.createElement('input', { type: "number", name: "layers", value: options.layers, onChange: handleOptionChange, min: "1", max: "10", className: "w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1" })
                )
            ),
            React.createElement('button', { onClick: handleTransform, disabled: isLoading, className: "mt-6 w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 disabled:bg-gray-600" }, "Transform Code")
        )
    );
};


// --- MAIN APP ---
const App = () => {
    const [activeTab, setActiveTab] = useState('Scanner');

    if (!API_KEY) {
        return React.createElement('div', { className: "min-h-screen flex items-center justify-center text-center p-4" },
            React.createElement('div', { className: "bg-red-900/50 border border-red-700 p-8 rounded-lg" },
                React.createElement(ShieldExclamationIcon, { className: "w-12 h-12 mx-auto text-red-400 mb-4" }),
                React.createElement('h2', { className: "text-2xl font-bold text-red-300 mb-2" }, "API Key Not Found"),
                React.createElement('p', { className: "text-red-300" }, "The Gemini API key is missing. Please ensure it is correctly configured in your environment to use this application.")
            )
        );
    }

    return React.createElement('div', null,
        React.createElement(Header, null),
        React.createElement('main', { className: "container mx-auto p-4 md:p-6" },
            React.createElement(Tabs, { activeTab: activeTab, setActiveTab: setActiveTab }),
            activeTab === 'Scanner' && React.createElement(ScannerView, null),
            activeTab === 'Obfuscator' && React.createElement(ObfuscatorTool, null)
        )
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
