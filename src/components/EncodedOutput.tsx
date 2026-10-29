import React, { useState } from 'react';
import type { HuffmanResult } from '../types/huffman';
import { Huffman } from '../core/huffman';
import { Binary, Copy, Check, Download, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EncodedOutputProps {
  result: HuffmanResult;
}

export const EncodedOutput: React.FC<EncodedOutputProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [verifyState, setVerifyState] = useState<{
    verified: boolean;
    lossless: boolean;
    decodedText: string;
  } | null>(null);

  if (result.empty || !result.encodedBitString) return null;

  const bitString = result.encodedBitString;
  const isTruncated = bitString.length > 500 && !showAll;
  const displayBits = isTruncated ? bitString.slice(0, 500) : bitString;

  const handleCopy = () => {
    navigator.clipboard.writeText(bitString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyLossless = () => {
    const { decodedText, isLossless } = Huffman.decode(bitString, result.codes);
    const matchesOriginal = decodedText === result.filteredText;
    setVerifyState({
      verified: true,
      lossless: isLossless && matchesOriginal,
      decodedText,
    });

    if (isLossless && matchesOriginal) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleDownload = (format: 'txt' | 'json') => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `huffman-encoded.${format}`;

    if (format === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify(
        {
          algorithm: 'Huffman Coding (BST-based Priority Queue)',
          originalLengthChars: result.originalLength,
          uniqueSymbols: result.uniqueSymbols,
          originalBits: result.metrics.originalBits,
          compressedBits: result.metrics.compressedBits,
          compressionRatio: result.metrics.compressionRatio,
          spaceSavingsPercent: result.metrics.spaceSavingsPercent,
          codes: result.codes,
          frequencies: result.frequencies,
          encodedBitString: result.encodedBitString,
        },
        null,
        2
      );
    } else {
      content = `--- HUFFMAN CODING SUMMARY ---\nOriginal Length: ${result.originalLength} chars\nCompressed Bits: ${result.encodedBitString.length} bits\nRatio: ${result.metrics.compressionRatio.toFixed(2)}x\n\n--- CODE TABLE ---\n${Object.entries(result.codes).map(([ch, code]) => `${ch}: ${code}`).join('\n')}\n\n--- ENCODED BITSTRING ---\n${result.encodedBitString}`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-500" />
            Encoded Bitstream & Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full binary stream, lossless round-trip validation, and export
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lossless verification button */}
          <button
            onClick={handleVerifyLossless}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Lossless Decode
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Bits!' : 'Copy Bitstream'}
          </button>

          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden text-xs">
            <button
              onClick={() => handleDownload('json')}
              className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              JSON
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={() => handleDownload('txt')}
              className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1"
            >
              TXT
            </button>
          </div>
        </div>
      </div>

      {/* Lossless verification badge feedback */}
      {verifyState?.verified && (
        <div
          className={`mb-4 p-4 rounded-2xl flex items-start gap-3 transition-all ${
            verifyState.lossless
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}
        >
          {verifyState.lossless ? (
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm">
            <div className="font-bold flex items-center gap-2">
              {verifyState.lossless ? '100% Lossless Round-Trip Verified' : 'Decode Mismatch Detected'}
              {verifyState.lossless && (
                <span className="bg-emerald-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  MATCH CONFIRMED
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              The encoded bitstream was traversed from root to leaf across each bit sequence, regenerating exactly the {result.originalLength} original characters without 1 bit of loss or distortion.
            </p>
          </div>
        </div>
      )}

      {/* Bitstream Display Box */}
      <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400 break-all leading-relaxed shadow-inner">
        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 pb-2 border-b border-slate-800 select-none">
          <span>BINARY STREAM ({bitString.length.toLocaleString()} BITS)</span>
          <span>{Math.ceil(bitString.length / 8)} BYTES</span>
        </div>
        <p className="font-mono-bits">
          {displayBits}
          {isTruncated && <span className="text-slate-500"> ... [truncated]</span>}
        </p>

        {bitString.length > 500 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Show all {bitString.length.toLocaleString()} bits
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
