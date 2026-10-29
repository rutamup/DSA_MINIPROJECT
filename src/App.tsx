import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Huffman } from './core/huffman';
import type { HuffmanResult } from './types/huffman';
import { InputPanel } from './components/InputPanel';
import { HeroComparison } from './components/HeroComparison';
import { MetricsDashboard } from './components/MetricsDashboard';
import { Visualizations } from './components/Visualizations';
import { CodeTable } from './components/CodeTable';
import { EncodedOutput } from './components/EncodedOutput';
import { Sun, Moon, Binary, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [input, setInput] = useState<string>('abracadabra');
  const [onlyAlnum, setOnlyAlnum] = useState<boolean>(false);
  const [includeOverhead, setIncludeOverhead] = useState<boolean>(false);
  const [highlightedSymbol, setHighlightedSymbol] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [result, setResult] = useState<HuffmanResult>(() => Huffman.encode('abracadabra', false));
  const [durationMs, setDurationMs] = useState<number | null>(0.8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Worker reference for large inputs
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    // Instantiate web worker
    try {
      workerRef.current = new Worker(
        new URL('./workers/huffman.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current.onmessage = (e) => {
        const { id, result: workerResult, durationMs: dMs } = e.data;
        if (id === requestIdRef.current) {
          setResult(workerResult);
          setDurationMs(dMs);
          setIsProcessing(false);
        }
      };
    } catch (e) {
      console.warn('Web worker unavailable, running synchronously:', e);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Debounced input processing
  useEffect(() => {
    setIsProcessing(true);
    const reqId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      // For large inputs (e.g. > 15k chars), use the Web Worker
      if (input.length > 15000 && workerRef.current) {
        workerRef.current.postMessage({ id: reqId, text: input, onlyAlnum });
      } else {
        const start = performance.now();
        const res = Huffman.encode(input, onlyAlnum);
        const duration = performance.now() - start;
        setResult(res);
        setDurationMs(duration);
        setIsProcessing(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [input, onlyAlnum]);

  // Symbol table entries
  const tableData = useMemo(() => {
    return Huffman.getSymbolTable(result);
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Huffman Compression Visualizer
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Optimal Prefix Coding • C++ BST-Priority Algorithm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-3.5 h-3.5" />
              C++ Algorithm Core
            </span>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Input Panel */}
        <InputPanel
          input={input}
          setInput={setInput}
          onlyAlnum={onlyAlnum}
          setOnlyAlnum={setOnlyAlnum}
          isProcessing={isProcessing}
          durationMs={durationMs}
        />

        {/* Hero Comparison: Original vs Huffman Bits */}
        <HeroComparison
          metrics={result.metrics}
          charCount={result.filteredText.length}
          empty={result.empty}
          isSingleChar={result.isSingleChar}
        />

        {!result.empty && (
          <>
            {/* Metrics Dashboard */}
            <MetricsDashboard
              metrics={result.metrics}
              uniqueSymbols={result.uniqueSymbols}
              includeOverhead={includeOverhead}
              setIncludeOverhead={setIncludeOverhead}
            />

            {/* Visualizations: Tree, Frequencies, Footprint */}
            <Visualizations
              tree={result.tree}
              tableData={tableData}
              metrics={result.metrics}
              highlightedSymbol={highlightedSymbol}
              setHighlightedSymbol={setHighlightedSymbol}
              isSingleChar={result.isSingleChar}
            />

            {/* Sortable Code Table */}
            <CodeTable
              entries={tableData}
              highlightedSymbol={highlightedSymbol}
              onHoverSymbol={setHighlightedSymbol}
            />

            {/* Encoded Output & Lossless Verification */}
            <EncodedOutput result={result} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Huffman Coding Visualizer</span>
            <span>•</span>
            <span>Deterministic BST Min-Priority Queue</span>
          </div>
          <div>
            Built with React, TypeScript, and modern Web Standards. Zero backend required.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
