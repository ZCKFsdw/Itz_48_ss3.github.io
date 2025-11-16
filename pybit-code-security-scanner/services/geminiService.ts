
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, Finding, AnalysisFindings, ObfuscationOptions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Utility to generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const findingItemSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A clear and concise description of the finding." },
        lines: {
            type: Type.ARRAY,
            description: "An array of line numbers where the issue was found. If not applicable, return an empty array.",
            items: { type: Type.INTEGER }
        }
    },
    required: ["description", "lines"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the overall security risk of the code." },
        riskScore: { type: Type.INTEGER, description: "An integer risk score from 0 (safe) to 10 (critical)." },
        findings: {
            type: Type.OBJECT,
            properties: {
                obfuscation: { type: Type.ARRAY, items: findingItemSchema, description: "Techniques used to hide the code's purpose." },
                antiDebugging: { type: Type.ARRAY, items: findingItemSchema, description: "Techniques to detect or evade debuggers." },
                antiVM: { type: Type.ARRAY, items: findingItemSchema, description: "Techniques to detect virtual machines or sandboxes." },
                suspiciousNetwork: { type: Type.ARRAY, items: findingItemSchema, description: "General suspicious network activity." },
                systemModifications: { type: Type.ARRAY, items: findingItemSchema, description: "Code that attempts to modify the system, like registry keys." },
                suspiciousFunctions: { type: Type.ARRAY, items: findingItemSchema, description: "Use of dangerous or suspicious functions like 'eval' or 'exec'." },
                informationStealing: { type: Type.ARRAY, items: findingItemSchema, description: "Techniques for stealing sensitive user data (e.g., Discord tokens, browser passwords, cookies, WiFi keys)." },
                commandAndControl: { type: Type.ARRAY, items: findingItemSchema, description: "Connections to C2 servers, including Discord/Telegram webhooks, IPs, and ports." },
                trojanIndicators: { type: Type.ARRAY, items: findingItemSchema, description: "Patterns or strings associated with known trojans or malware families (e.g., XWorm RAT)." }
            },
            required: ["obfuscation", "antiDebugging", "antiVM", "suspiciousNetwork", "systemModifications", "suspiciousFunctions", "informationStealing", "commandAndControl", "trojanIndicators"]
        }
    },
    required: ["summary", "riskScore", "findings"],
};

const extractLinks = (findings: AnalysisFindings): string[] => {
    const links: string[] = [];
    const urlRegex = /(https?:\/\/(?:discord\.com\/api\/webhooks|t\.me)\/[^\s'"]+)/g;

    const checkCategory = (category: Finding[]) => {
        if (!category) return;
        for (const finding of category) {
            const matches = finding.description.match(urlRegex);
            if (matches) {
                links.push(...matches);
            }
        }
    };
    
    checkCategory(findings.commandAndControl);
    checkCategory(findings.suspiciousNetwork);

    return [...new Set(links)]; // Return unique links
};

export const analyzeCode = async (content: string, sourceType: 'python' | 'bat' | 'exe_strings' = 'python'): Promise<AnalysisResult> => {
    let analysisSubject = '';
    let codeContext = '';

    switch(sourceType) {
        case 'python':
            analysisSubject = 'Python code snippet';
            codeContext = `Code to analyze:\n\`\`\`python\n${content}\n\`\`\``;
            break;
        case 'bat':
            analysisSubject = 'Windows batch script';
            codeContext = `Script to analyze:\n\`\`\`batch\n${content}\n\`\`\``;
            break;
        case 'exe_strings':
            analysisSubject = 'collection of strings extracted from an executable (.exe) file';
            codeContext = `Strings to analyze:\n\`\`\`\n${content}\n\`\`\``;
            break;
    }
    
    const prompt = `
Analyze the following ${analysisSubject} for security vulnerabilities and malicious patterns, inspired by the logic of a malware analysis tool. Identify and categorize any findings.

${codeContext}

Provide a detailed analysis in JSON format according to the specified schema.
The analysis should include:
1.  An overall summary of the code's potential risk.
2.  A risk score from 0 (safe) to 10 (critical).
3.  A detailed breakdown of findings, categorized into:
    - Obfuscation (e.g., base64, long variable names, excessive concatenation, use of eval/exec)
    - Anti-Debugging (e.g., isdebuggerpresent, sys.gettrace)
    - Anti-VM / Anti-Sandbox (e.g., checking for VMWare drivers, specific registry keys, mouse event checks)
    - Suspicious Network Activity (e.g., hardcoded webhook URLs, suspicious domains)
    - Malicious System Modifications (e.g., Windows registry modifications)
    - Suspicious Functions (e.g., imports of 'ctypes', 'win32api', file system access to sensitive areas)
    - Information Stealing (specifically look for code targeting Discord tokens, browser passwords/history/cookies, crypto wallets, or WiFi keys)
    - Command and Control (identify Discord webhooks, Telegram bot tokens, hardcoded IPs and ports)
    - Trojan Indicators (identify patterns of known malware like XWorm RAT, AsyncRAT, etc.)
For each finding, provide a description and the line number(s) where it occurs. If the input is from extracted EXE strings, line numbers are not relevant, so return an empty array for the 'lines' property. If no issues are found in a category, return an empty array for it. Be strict and thorough in your analysis.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("The AI model returned an empty response. This may be due to the content being flagged by safety filters.");
        }

        let result;
        try {
            result = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON response:", jsonText);
            throw new Error("The AI model returned an invalid response. The request may have been blocked or resulted in an error.");
        }

        const expectedFindingKeys: (keyof AnalysisResult['findings'])[] = [
            "obfuscation", "antiDebugging", "antiVM", "suspiciousNetwork", 
            "systemModifications", "suspiciousFunctions", "informationStealing", 
            "commandAndControl", "trojanIndicators"
        ];

        if (!result.findings) {
            result.findings = {};
        }

        for (const key of expectedFindingKeys) {
            if (!result.findings[key]) {
                result.findings[key] = [];
            }
            // Add a unique ID to each finding
            result.findings[key] = result.findings[key].map((f: Omit<Finding, 'id'>) => ({ ...f, id: generateId() }));
        }
        
        const detectedLinks = extractLinks(result.findings);
        if (detectedLinks.length > 0) {
            result.detectedLinks = detectedLinks;
        }

        return result as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing code with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error("The API key is invalid. Please check your configuration.");
            }
            throw new Error(`AI analysis failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code analysis.");
    }
};

export const transformCode = async (
    code: string, 
    mode: 'obfuscate' | 'deobfuscate', 
    options: ObfuscationOptions
): Promise<string> => {
    
    let prompt = `You are an expert Python code transformation tool. Your task is to apply specific obfuscation or deobfuscation techniques to the provided Python code. Your output must be ONLY the transformed Python code, with no explanations, markdown formatting, or any extra text.`;

    if (mode === 'obfuscate') {
        prompt += `

Apply the following obfuscation options to the code below. The order of operations should be: Mangle names -> Dead code insertion -> String obfuscation -> Anti-debug/Expiration/Binding -> Compression -> Encoding.

Obfuscation Options:
- Mangle Names: ${options.mangle}
- Dead Code Density: ${options.deadCode}
- String-only Obfuscation: ${options.stringOnly}
- Add Anti-Debugging: ${options.antiDebug}
- Expiration Date (YYYY-MM-DD): ${options.expire || 'None'}
- Bind to Hardware: ${options.bindHw}
- Compress: ${options.compress}
- Encoding Method: ${options.method}
- Encoding Layers: ${options.layers}

Original Code:
\`\`\`python
${code}
\`\`\`
`;
    } else { // deobfuscate
        prompt += `

You are an expert Python deobfuscator. Your task is to reverse the encoding layers of the provided script.
Recursively decode the script by detecting the encoding method (e.g., base64, hex, aes, xor, rsa, zlib compression) and applying the reverse operation, layer by layer, until the original source code is revealed.

Obfuscated Code:
\`\`\`python
${code}
\`\`\`
`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro", // Using a more powerful model for complex code generation
            contents: prompt,
        });

        const transformedCode = response.text?.trim();
        if (!transformedCode) {
            throw new Error("The AI model returned an empty response.");
        }
        
        // Clean up the response to ensure it's just code
        return transformedCode.replace(/^```python\n|```$/g, '').trim();

    } catch (error) {
        console.error("Error transforming code with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error("The API key is invalid. Please check your configuration.");
            }
            throw new Error(`AI code transformation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code transformation.");
    }
};
