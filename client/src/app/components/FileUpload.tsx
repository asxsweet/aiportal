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
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      {!selectedFile ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">{acceptedFormats.replace(/\./g, '').toUpperCase()}</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFormats}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}
