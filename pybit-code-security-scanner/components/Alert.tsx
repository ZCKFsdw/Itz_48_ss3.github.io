
import React from 'react';

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg flex items-start justify-between animate-fade-in" role="alert">
      <div>
        <h3 className="font-bold">An Error Occurred</h3>
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 p-1 rounded-md hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Alert;
