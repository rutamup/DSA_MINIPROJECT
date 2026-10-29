import React, { useRef } from 'react';
import { Upload, Sparkles, FileText, Info } from 'lucide-react';

interface InputPanelProps {
  input: string;
  setInput: (val: string) => void;
  onlyAlnum: boolean;
  setOnlyAlnum: (val: boolean) => void;
  isProcessing: boolean;
  durationMs: number | null;
}

const SAMPLES = [
  { name: 'Abracadabra', text: 'abracadabra' },
  { name: 'Single Char (aaaa)', text: 'aaaaaaaaaaaaaaaaaaaa' },
  { name: 'English Pangram', text: 'The quick brown fox jumps over the lazy dog.' },
  { name: 'Shakespeare (Hamlet)', text: 'To be, or not to be, that is the question: Whether \'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them.' },
  { name: 'Source Code (C++)', text: 'int fib(int n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}' },
  { name: 'Repeated Patterns', text: 'ABABABABABABCDCDCDCDCDCDABCDABCD' },
];

export const InputPanel: React.FC<InputPanelProps> = ({
  input,
  setInput,
  onlyAlnum,
  setOnlyAlnum,
  isProcessing,
  durationMs,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content || '');
    };
    reader.readAsText(file);
    // Reset file input so same file can be reloaded
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Input Data</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {input.length.toLocaleString()} {input.length === 1 ? 'char' : 'chars'}
          </span>
          {durationMs !== null && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({durationMs.toFixed(1)} ms)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Alnum vs All characters toggle */}
          <div className="relative group flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 px-3 py-1.5 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={onlyAlnum}
                onChange={(e) => setOnlyAlnum(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Only letters & digits (isalnum)</span>
              <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </label>
            {/* Tooltip */}
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-72 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-20 pointer-events-none">
              When checked, spaces, punctuation, and newlines are stripped, matching the C++ <code className="text-emerald-300">isalnum</code> filter. Unchecked handles all Unicode & ASCII symbols.
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.json,.csv,.md,.cpp,.c,.h,.py,.js,.ts"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Upload .txt
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here to visualize Huffman tree and encoding metrics..."
          rows={5}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm leading-relaxed transition-all resize-y"
        />
        {isProcessing && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Processing...
          </div>
        )}
      </div>

      {/* Preset samples */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Load sample:
        </span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.name}
            onClick={() => setInput(sample.text)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
          >
            {sample.name}
          </button>
        ))}
        {input && (
          <button
            onClick={() => setInput('')}
            className="text-xs px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
          >
            Clear input
          </button>
        )}
      </div>
    </div>
  );
};
