import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetPrompts = [
    "Cyberpunk neon style",
    "Pencil sketch",
    "Watercolor painting",
    "Vintage 1950s photo",
    "Professional studio lighting",
    "Cinematic 4k render",
    "Make it snowy"
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null); // Reset generated on new upload
      };
      reader.readAsDataURL(file);
      
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    try {
      // Determine mime type from base64 string
      const mimeType = selectedImage.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      const result = await editImage(selectedImage, prompt, mimeType);
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
      alert('Failed to edit image. Please ensure your API key supports this model.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = generatedImage;
    
    // Extract extension from mime type for the filename
    const mimeType = generatedImage.match(/data:([^;]+);/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `gemini-edited.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2.94 0l7-7a2 2 0 0 0 2.12-2.94L16.49 5a2 2 0 0 0-2.61-.06l-6.26 6.27a2 2 0 0 0 0 2.82L11 17.5"/><path d="m15.5 10.5 2.18-2.18a.5.5 0 0 1 .7 0l2.64 2.64a.5.5 0 0 1 0 .7L18.82 13.82"/><path d="M2 2l19.8 19.8"/><path d="M15 5.88 5.88 15"/></svg>
            </span>
            Magic Image Editor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                Upload an image and use natural language to transform it using Gemini 2.5 Flash Image.
                Describe changes like "make it cyberpunk" or "remove background".
            </p>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[400px]">
        {/* Source Image */}
        <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col relative group">
          <div className="flex justify-between items-center mb-4 px-1">
             <div className="flex items-center gap-2">
                 <div className="w-2 h-6 rounded-full bg-gray-500 dark:bg-gray-700"></div>
                 <h3 className="font-semibold text-gray-800 dark:text-gray-200">Original Source</h3>
             </div>
             {selectedImage && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs glass-button text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    Replace
                </button>
             )}
          </div>
          
          <div 
            className={`flex-1 min-h-[300px] border-2 border-dashed border-gray-300 dark:border-gray-700/50 rounded-xl flex items-center justify-center overflow-hidden bg-gray-100/50 dark:bg-gray-900/30 transition-all duration-300 ${!selectedImage ? 'cursor-pointer hover:border-purple-500/50 hover:bg-gray-200/50 dark:hover:bg-gray-800/30' : ''}`}
            onClick={() => !selectedImage && fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Original" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="text-center p-6 text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="font-medium">Click to upload image</p>
                <p className="text-xs mt-1 opacity-70">Supports JPG, PNG</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Generated Image */}
        <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col relative">
          <div className="flex justify-between items-center mb-4 px-1">
             <div className="flex items-center gap-2">
                 <div className="w-2 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                 <h3 className="font-semibold text-gray-800 dark:text-gray-200">Generated Result</h3>
             </div>
             {generatedImage && (
                <button 
                    onClick={handleDownload}
                    className="text-xs glass-button text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download
                </button>
             )}
          </div>

          <div className="flex-1 min-h-[300px] bg-gray-100/50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/5 relative shadow-inner">
            {loading ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                 </div>
                 <p className="text-purple-500 dark:text-purple-300 text-sm animate-pulse font-medium tracking-wide">Magic in progress...</p>
               </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Generated" className="w-full h-full object-contain rounded-lg shadow-2xl" />
            ) : (
              <div className="text-center p-6 text-gray-500 dark:text-gray-600">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200/50 dark:bg-gray-800/50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
                  </div>
                 <p className="text-sm">Modified image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-2xl relative z-10">
        
        {/* Presets */}
        <div className="flex flex-wrap gap-2 items-center">
             <div className="flex items-center gap-2 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions:</span>
             </div>
             {presetPrompts.map((p) => (
                <button 
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-200 transition-all border border-gray-200 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/30 whitespace-nowrap"
                >
                    {p}
                </button>
             ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <div className="flex-1 w-full relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               </div>
               <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Describe your edit (e.g., "Add a retro filter", "Remove background", "Make it snowy")'
                className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage || !prompt}
              className={`h-[56px] px-8 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                loading || !selectedImage || !prompt
                  ? 'bg-gray-200 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-white/5'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transform hover:-translate-y-0.5'
              }`}
            >
              <span>Generate</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;