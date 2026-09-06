import React, { useState, useRef } from 'react';
import { extractTextFromFile } from '../../services/fileParser';
import { useUser } from '../../context/UserContext';
import { UploadCloud, FileText, Check, AlertCircle, X, Loader2 } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextLoaded: (extractedText: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onTextLoaded }) => {
  const { showToast } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const extracted = await extractTextFromFile(file);
      if (!extracted || extracted.trim().length === 0) {
        throw new Error('No readable text found in this file.');
      }

      onTextLoaded(extracted.trim());
      showToast(`Successfully imported text from "${file.name}"`, 'success');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to extract text from file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Script Document</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Extract speech text directly from files</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            isDragging
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx,.pdf,.md,.csv"
            onChange={handleInputChange}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Extracting text content...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Click to browse or drag & drop your document
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports <span className="font-semibold text-slate-700 dark:text-slate-300">.TXT, .DOCX, .PDF, .MD</span> (up to 10MB)
              </p>
            </>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
