
export interface Finding {
  id: string;
  description: string;
  lines: number[];
}

export interface AnalysisFindings {
  obfuscation: Finding[];
  antiDebugging: Finding[];
  antiVM: Finding[];
  suspiciousNetwork: Finding[];
  systemModifications: Finding[];
  suspiciousFunctions: Finding[];
  informationStealing: Finding[];
  commandAndControl: Finding[];
  trojanIndicators: Finding[];
}

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  findings: AnalysisFindings;
  detectedLinks?: string[];
}

export interface ObfuscationOptions {
  method: 'base64' | 'hex' | 'ascii' | 'aes' | 'xor' | 'rsa' | 'mix';
  layers: number;
  mangle: boolean;
  deadCode: 'none' | 'low' | 'medium' | 'high';
  stringOnly: boolean;
  compress: boolean;
  antiDebug: boolean;
  expire: string;
  bindHw: boolean;
}
