export interface HuffmanNodeData {
  id: number;
  freq: number;
  isLeaf: boolean;
  symbol: string | null;
  charCode: number | null;
  left: HuffmanNodeData | null;
  right: HuffmanNodeData | null;
}

export interface HuffmanResult {
  empty: boolean;
  filteredText: string;
  originalLength: number;
  uniqueSymbols: number;
  encodedBitString: string;
  codes: Record<string, string>;
  frequencies: Record<string, number>;
  tree: HuffmanNodeData | null;
  isSingleChar: boolean;
  metrics: HuffmanMetrics;
}

export interface HuffmanMetrics {
  originalBytes: number;
  originalBits: number;
  compressedBits: number;
  bitsSaved: number;
  compressionRatio: number; // originalBits / compressedBits
  spaceSavingsPercent: number; // (1 - compressedBits / originalBits) * 100
  avgCodeLength: number; // sum(freq * codeLength) / totalChars
  entropy: number; // Shannon entropy in bits/symbol
  codingEfficiency: number; // entropy / avgCodeLength
  redundancy: number; // avgCodeLength - entropy
  fixedLengthBitsPerChar: number; // ceil(log2(uniqueSymbols))
  fixedLengthTotalBits: number;
  codeTableOverheadBits: number; // Overhead estimation: 8 bits per char + 8 bits length + bits of code
  totalBitsWithOverhead: number;
  effectiveRatioWithOverhead: number;
  effectiveSavingsWithOverhead: number;
}

export interface SymbolTableEntry {
  symbol: string;
  displaySymbol: string;
  charCode: number;
  frequency: number;
  percentage: number;
  code: string;
  codeLength: number;
  totalBits: number;
}
