import { Upload, File, X } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string;
  label?: string;
}

export default function FileUpload({ onFileSelect, acceptedFormats = '.pdf,.doc,.docx', label }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">{label}</label>
      )}

      {!selectedFile ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors bg-white/50 dark:bg-zinc-950/30">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 dark:text-zinc-500 mb-2" />
            <p className="mb-2 text-sm text-gray-500 dark:text-zinc-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{acceptedFormats.replace(/\./g, '').toUpperCase()}</p>
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} accept={acceptedFormats} />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/80 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>
      )}
    </div>
  );
}
