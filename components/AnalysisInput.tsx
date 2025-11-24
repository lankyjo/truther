import React, { useState, useRef } from 'react';

interface AnalysisInputProps {
  onAnalyze: (text: string, file: File | null) => void;
}

export const AnalysisInput: React.FC<AnalysisInputProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      const textFromClipboard = await navigator.clipboard.readText();
      setText(textFromClipboard);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert("Please use keyboard shortcuts: Ctrl+V (Windows) or Cmd+V (Mac).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(text, file);
  };

  return (
    <div className="bg-white border-2 border-black p-6 md:p-8 shadow-hard relative">
      <div className="absolute -top-3 left-4 bg-white px-2 border-l-2 border-r-2 border-black text-xs font-bold uppercase tracking-widest">
        Input Terminal
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-2">
        
        {/* Text Input Section */}
        <div>
          <label htmlFor="urlInput" className="block text-sm font-bold text-black uppercase mb-2 font-display">
            Target URL / Text Data
          </label>
          <div className="relative">
            <input
              id="urlInput"
              type="text"
              className="w-full p-4 pr-24 text-lg border-2 border-black focus:bg-gray-50 focus:outline-none focus:ring-0 font-mono transition-all placeholder-gray-400"
              placeholder="PASTE LINK OR FULL TEXT HERE..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-2 bottom-2 bg-gray-100 hover:bg-gray-200 text-black border-2 border-black font-bold px-4 text-xs uppercase tracking-wider transition-colors"
            >
              Paste
            </button>
          </div>
          {/* Helper Tip */}
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
             <span className="text-black font-bold">INFO:</span>
             <p className="font-mono">
               Paste URLs, full text of posts, or rumors. If a link isn't found, try uploading the video or image directly.
             </p>
          </div>
        </div>

        <div className="text-center">
          <span className="bg-white px-2 text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
        </div>

        {/* File Upload Section */}
        <div>
          
          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-300 hover:border-black p-6 flex flex-col items-center justify-center cursor-pointer transition-all group bg-gray-50 hover:bg-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-gray-400 group-hover:text-black mb-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-black font-bold text-sm uppercase">Upload visual evidence</p>
              <p className="text-gray-500 text-xs mt-1 font-mono">JPG, PNG, MP4 Supported</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between border-2 border-black bg-gray-100 p-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-mono text-sm font-bold truncate">{file.name}</span>
              </div>
              <button 
                type="button" 
                onClick={handleClearFile}
                className="text-black hover:bg-black hover:text-white border border-black p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!text && !file}
          className={`w-full py-4 border-2 border-black font-black text-lg uppercase tracking-wider shadow-hard transform transition-all 
            ${(!text && !file) 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300 shadow-none' 
              : 'bg-black text-white hover:-translate-y-1 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard'
            }`}
        >
          Initiate Scan
        </button>
      </form>
    </div>
  );
};
