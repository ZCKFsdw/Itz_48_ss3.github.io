
import React, { useState, useCallback, useRef } from 'react';
import { DocumentArrowUpIcon, XCircleIcon, ArrowPathIcon } from './icons';

interface CodeInputProps {
  textInput: string;
  setTextInput: (text: string) => void;
  onFileChange: (file: File | null) => void;
  onScan: () => void;
  isLoading: boolean;
  isProcessingFile: boolean;
  file: File | null;
  fileContent: string | null;
}

const placeholderCode = `import os
import base64

# This is just an example. 
# Paste your code here or drag and drop a .py, .bat, or .exe file.

def run_command(cmd):
    os.system(cmd)

encoded_cmd = "aW1wb3J0IHdlYmJyb3dzZXIKd2ViYnJvd3Nlci5vcGVuKCdodHRwczovL2V4YW1wbGUuY29tJyk="
decoded_cmd = base64.b64decode(encoded_cmd).decode('utf-8')

exec(decoded_cmd)
`;

const CodeInput: React.FC<CodeInputProps> = ({ textInput, setTextInput, onFileChange, onScan, isLoading, isProcessingFile, file, fileContent }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onFileChange(null);
  };
  
  const handleAreaClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const hasContent = !!(textInput.trim() || file);

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        className={`relative transition-all duration-300 rounded-lg border-2 ${
          isDraggingOver ? 'border-blue-500 bg-gray-700/30' : 'border-gray-700/50'
        } ${file || isProcessingFile ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {isProcessingFile && (
           <div className="absolute inset-0 bg-[#0D1117]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 rounded-lg">
                <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin"/>
                <p className="mt-4 text-lg font-semibold text-gray-200">Processing file, please wait...</p>
                <p className="text-sm text-gray-400">Large files may take a moment.</p>
           </div>
        )}
        {file && !isProcessingFile && (
          <div className="absolute inset-0 bg-[#0D1117]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 rounded-lg">
            <DocumentArrowUpIcon className="w-16 h-16 text-green-400" />
            <p className="mt-2 text-lg font-semibold text-gray-200">{file.name}</p>
            <p className="text-sm text-gray-400">Ready for analysis</p>
            <button
              onClick={handleClearFile}
              className="mt-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transform transition-transform hover:scale-105"
              aria-label="Clear file"
            >
              <XCircleIcon className="w-5 h-5" />
              Clear File
            </button>
          </div>
        )}
        {isDraggingOver && !file && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 rounded-lg pointer-events-none">
            <DocumentArrowUpIcon className="w-16 h-16 text-blue-400" />
            <p className="mt-2 text-lg font-semibold text-gray-200">Drop your file here</p>
            <p className="text-sm text-gray-400">(.py, .bat, .exe)</p>
          </div>
        )}
        <textarea
          value={file ? (file.name.endsWith('.exe') ? `--- Extracted Strings from ${file.name} ---\n\n${fileContent}` : fileContent ?? '') : textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={placeholderCode}
          className="w-full h-96 p-4 bg-gray-900/50 rounded-lg shadow-inner text-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          spellCheck="false"
          disabled={!!file || isProcessingFile}
          readOnly={!!file}
        />
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".py,.bat,.exe"
        />
      </div>

      <button
        onClick={onScan}
        disabled={isLoading || isProcessingFile || !hasContent}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 ease-in-out self-start flex items-center gap-2 transform hover:-translate-y-1 active:translate-y-0"
      >
        {isProcessingFile ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin"/>
              Processing...
            </>
        ) : (
          'Scan Now'
        )}
      </button>
    </div>
  );
};

export default CodeInput;