import React, { useState, useEffect, useRef } from 'react';
import { Huffman } from './core/huffman';
import type { HuffmanResult } from './types/huffman';
import { InputPanel } from './components/InputPanel';
import { HeroComparison } from './components/HeroComparison';
import { MetricsDashboard } from './components/MetricsDashboard';
import { Visualizations } from './components/Visualizations';
import { Binary } from 'lucide-react';

export const App: React.FC = () => {
  const [input, setInput] = useState<string>('abracadabra');
  const [onlyAlnum, setOnlyAlnum] = useState<boolean>(false);
  const [result, setResult] = useState<HuffmanResult>(() => Huffman.encode('abracadabra', false));
  const [durationMs, setDurationMs] = useState<number | null>(0.8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                Hoffman Compression Visualizer
              </h1>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-2 space-y-0">
        {/* Input Panel */}
        <InputPanel
          input={input}
          setInput={setInput}
          onlyAlnum={onlyAlnum}
          setOnlyAlnum={setOnlyAlnum}
          isProcessing={isProcessing}
          durationMs={durationMs}
        />

        {/* Tree Representation */}
        <Visualizations tree={result.tree} />

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
            />

          </>
        )}
      </main>
    </div>
  );
};

export default App;
