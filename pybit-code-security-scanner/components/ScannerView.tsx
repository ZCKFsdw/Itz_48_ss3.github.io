
import React, { useState, useCallback, useEffect } from 'react';
import CodeInput from './CodeInput';
import ResultsDisplay from './ResultsDisplay';
import Alert from './Alert';
import CodeDisplay from './CodeDisplay';
import ScanningProgress from './ScanningProgress';
import { analyzeCode } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import { ShieldExclamationIcon } from './icons';

type SourceType = 'python' | 'bat' | 'exe_strings';
interface ScannedContent {
  content: string;
  type: SourceType;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const workerCode = `
  const extractStrings = (buffer, minLength = 5) => {
    const bytes = new Uint8Array(buffer);
    let result = '';
    let currentString = '';

    for (let i = 0; i < bytes.length; i++) {
      const charCode = bytes[i];
      if ((charCode >= 32 && charCode <= 126) || charCode === 9 || charCode === 10 || charCode === 13) {
        currentString += String.fromCharCode(charCode);
      } else {
        if (currentString.length >= minLength) {
          result += currentString + '\\n';
        }
        currentString = '';
      }
    }
    
    if (currentString.length >= minLength) {
      result += currentString;
    }

    return result.trim();
  };

  self.onmessage = async (event) => {
    const file = event.data;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let content;
      let sourceType;

      if (extension === 'py' || extension === 'bat') {
          content = await file.text();
          sourceType = (extension === 'py' ? 'python' : 'bat');
      } else if (extension === 'exe') {
          const buffer = await file.arrayBuffer();
          content = extractStrings(buffer);
          sourceType = 'exe_strings';
      } else {
          throw new Error('Unsupported file type.');
      }
      self.postMessage({ status: 'success', content, sourceType });
    } catch (e) {
      self.postMessage({ status: 'error', message: e.message || 'An unknown error occurred in the file processing worker.' });
    }
  };
`;

const ScannerView: React.FC = () => {
  const [textInput, setTextInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('python');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [scannedContent, setScannedContent] = useState<ScannedContent | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    setError(null);
    setAnalysisResult(null);
    setScannedContent(null);
    
    if (!selectedFile) {
        setFile(null);
        setFileContent(null);
        if (textInput === '') setSourceType('python');
        return;
    }

    setFile(selectedFile);
    setTextInput('');

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
        setFile(null);
        setFileContent(null);
        return;
    }

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['py', 'bat', 'exe'];
    if (!extension || !supportedExtensions.includes(extension)) {
      setError(`Unsupported file type: .${extension}. Please upload a .py, .bat, or .exe file.`);
      setFile(null);
      setFileContent(null);
      return;
    }

    setIsProcessingFile(true);

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (event) => {
      const { status, content, sourceType, message } = event.data;
      if (status === 'success') {
        setFileContent(content);
        setSourceType(sourceType);
      } else {
        setError(message || 'Failed to process the file.');
        setFile(null);
        setFileContent(null);
      }
      setIsProcessingFile(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      setError(`An unexpected error occurred while processing the file: ${err.message}`);
      setFile(null);
      setFileContent(null);
      setIsProcessingFile(false);
      worker.terminate();
    };

    worker.postMessage(selectedFile);

  }, [textInput]);

  const handleScan = useCallback(async () => {
    const contentToScan = fileContent || textInput;
    if (!contentToScan.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setScannedContent(null);

    const currentSourceType = file ? sourceType : 'python';
    setScannedContent({ content: contentToScan, type: currentSourceType });

    try {
      const result = await analyzeCode(contentToScan, currentSourceType);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during AI analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [textInput, file, fileContent, sourceType]);
  
  const handleFindingClick = (lineNumber: number) => {
    setHighlightedLine(null); // Reset to re-trigger effect if same line is clicked
    setTimeout(() => setHighlightedLine(lineNumber), 50);
  };

  return (
    <>
      {isLoading && <ScanningProgress />}
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-100">Intelligent Code & File Analysis</h2>
          <p className="text-gray-400 max-w-2xl">
            Paste code or upload a file (.py, .bat, .exe). Our AI will perform a deep security analysis to uncover potential threats, from obfuscation to command & control channels.
          </p>
        </div>
        
        <div className="bg-[#161B22]/70 border border-gray-700/50 p-4 sm:p-6 rounded-xl shadow-2xl">
            <CodeInput 
                textInput={textInput}
                setTextInput={setTextInput}
                onFileChange={handleFileChange}
                onScan={handleScan}
                isLoading={isLoading}
                isProcessingFile={isProcessingFile}
                file={file}
                fileContent={fileContent}
            />
        </div>
        
        <div className="mt-8">
          {error && (
            <Alert message={error} onClose={() => setError(null)} />
          )}
          
          {!isLoading && !error && scannedContent && analysisResult && (
            <div className="space-y-8">
              <CodeDisplay 
                code={scannedContent.content}
                language={scannedContent.type === 'bat' ? 'batch' : (scannedContent.type === 'python' ? 'python' : 'text')}
                findings={analysisResult.findings}
                highlightedLine={highlightedLine}
              />
              <ResultsDisplay result={analysisResult} onFindingClick={handleFindingClick}/>
            </div>
          )}

          {!isLoading && !error && !analysisResult && !scannedContent && (
               <div className="text-center py-10 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
                  <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold">Awaiting Analysis</h2>
                  <p>Results will be displayed here once the scan is complete.</p>
              </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ScannerView;