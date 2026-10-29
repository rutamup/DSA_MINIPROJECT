import type { HuffmanMetrics, HuffmanNodeData, HuffmanResult, SymbolTableEntry } from '../types/huffman';

/**
 * Node for the Huffman Tree.
 * Follows the exact C++ HuffmanNode structure.
 */
export class HuffmanNode {
  data: string;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;

  constructor(data: string, freq: number, left: HuffmanNode | null = null, right: HuffmanNode | null = null) {
    this.data = data;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

/**
 * Node for the BST-based priority queue.
 * Faithful mirror of the C++ BSTNode structure.
 */
class BSTNode {
  treeNode: HuffmanNode;
  left: BSTNode | null;
  right: BSTNode | null;

  constructor(node: HuffmanNode) {
    this.treeNode = node;
    this.left = null;
    this.right = null;
  }
}

/**
 * Priority queue backed by a Binary Search Tree (BST),
 * identically matching the C++ insert and extractMin logic and tie-breaking.
 */
export class BSTPriorityQueue {
  private root: BSTNode | null = null;

  private insertHelper(curr: BSTNode | null, node: HuffmanNode): BSTNode {
    if (!curr) return new BSTNode(node);
    if (node.freq < curr.treeNode.freq) {
      curr.left = this.insertHelper(curr.left, node);
    } else {
      curr.right = this.insertHelper(curr.right, node);
    }
    return curr;
  }

  insert(node: HuffmanNode): void {
    this.root = this.insertHelper(this.root, node);
  }

  private extractMinHelper(curr: BSTNode | null): { root: BSTNode | null; minNode: BSTNode | null } {
    if (!curr) return { root: null, minNode: null };
    if (!curr.left) {
      return { root: curr.right, minNode: curr };
    }
    const res = this.extractMinHelper(curr.left);
    curr.left = res.root;
    return { root: curr, minNode: res.minNode };
  }

  extractMin(): HuffmanNode | null {
    if (!this.root) return null;
    const { root, minNode } = this.extractMinHelper(this.root);
    this.root = root;
    return minNode ? minNode.treeNode : null;
  }

  isEmpty(): boolean {
    return this.root === null;
  }
}

/**
 * Core Huffman encoder faithfully matching the C++ algorithm
 */
export class Huffman {
  /**
   * Code generation recursion walking left=0, right=1.
   * Special case: single node receives code "0".
   */
  private static generateCodes(
    node: HuffmanNode | null,
    currentCode: string,
    codes: Record<string, string>
  ): void {
    if (!node) return;
    if (!node.left && !node.right) {
      codes[node.data] = currentCode.length === 0 ? '0' : currentCode;
      return;
    }
    if (node.left) this.generateCodes(node.left, currentCode + '0', codes);
    if (node.right) this.generateCodes(node.right, currentCode + '1', codes);
  }

  /**
   * Convert HuffmanNode tree into plain JSON serializable format for D3/SVG visualization
   */
  private static serializeTree(node: HuffmanNode | null, id: number = 0): HuffmanNodeData | null {
    if (!node) return null;
    const isLeaf = !node.left && !node.right;
    return {
      id,
      freq: node.freq,
      isLeaf,
      symbol: isLeaf ? node.data : null,
      charCode: isLeaf ? node.data.charCodeAt(0) : null,
      left: this.serializeTree(node.left, id * 2 + 1),
      right: this.serializeTree(node.right, id * 2 + 2),
    };
  }

  /**
   * Compute comprehensive compression, theoretical information metrics
   */
  public static calculateMetrics(
    filteredText: string,
    freqMap: Record<string, number>,
    codes: Record<string, string>,
    encodedBitString: string
  ): HuffmanMetrics {
    const totalChars = filteredText.length;
    if (totalChars === 0) {
      return {
        originalBytes: 0,
        originalBits: 0,
        compressedBits: 0,
        bitsSaved: 0,
        compressionRatio: 0,
        spaceSavingsPercent: 0,
        avgCodeLength: 0,
        entropy: 0,
        codingEfficiency: 0,
        redundancy: 0,
        fixedLengthBitsPerChar: 0,
        fixedLengthTotalBits: 0,
        codeTableOverheadBits: 0,
        totalBitsWithOverhead: 0,
        effectiveRatioWithOverhead: 0,
        effectiveSavingsWithOverhead: 0,
      };
    }

    // Standard 8 bits per character (ASCII/1 byte per code unit)
    const originalBits = totalChars * 8;
    const compressedBits = encodedBitString.length;
    const bitsSaved = originalBits - compressedBits;
    const compressionRatio = compressedBits > 0 ? originalBits / compressedBits : 0;
    const spaceSavingsPercent = originalBits > 0 ? ((originalBits - compressedBits) / originalBits) * 100 : 0;

    // Shannon entropy: H = -sum(p_i * log2(p_i))
    let entropy = 0;
    let avgCodeLength = 0;
    const uniqueSymbols = Object.keys(freqMap).length;

    for (const [sym, count] of Object.entries(freqMap)) {
      const p = count / totalChars;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
      const codeLen = codes[sym] ? codes[sym].length : 0;
      avgCodeLength += p * codeLen;
    }

    const codingEfficiency = avgCodeLength > 0 ? (entropy / avgCodeLength) : 0;
    const redundancy = Math.max(0, avgCodeLength - entropy);

    // Fixed-length coding: ceil(log2(uniqueSymbols))
    const fixedLengthBitsPerChar = uniqueSymbols > 1 ? Math.ceil(Math.log2(uniqueSymbols)) : 1;
    const fixedLengthTotalBits = totalChars * fixedLengthBitsPerChar;

    // Code table storage overhead estimation:
    // For each unique symbol:
    // - 8 bits to represent the character
    // - 5 bits to store the code length (codes <= 32 bits)
    // - L bits for the actual variable-length code
    let codeTableOverheadBits = 0;
    for (const [_sym, code] of Object.entries(codes)) {
      codeTableOverheadBits += 8 + 5 + code.length;
    }
    // Plus 8 bits for table size count
    codeTableOverheadBits += 8;

    const totalBitsWithOverhead = compressedBits + codeTableOverheadBits;
    const effectiveRatioWithOverhead = totalBitsWithOverhead > 0 ? originalBits / totalBitsWithOverhead : 0;
    const effectiveSavingsWithOverhead = originalBits > 0
      ? ((originalBits - totalBitsWithOverhead) / originalBits) * 100
      : 0;

    return {
      originalBytes: totalChars,
      originalBits,
      compressedBits,
      bitsSaved,
      compressionRatio,
      spaceSavingsPercent,
      avgCodeLength,
      entropy,
      codingEfficiency,
      redundancy,
      fixedLengthBitsPerChar,
      fixedLengthTotalBits,
      codeTableOverheadBits,
      totalBitsWithOverhead,
      effectiveRatioWithOverhead,
      effectiveSavingsWithOverhead,
    };
  }

  /**
   * Main Huffman encoding pipeline
   */
  public static encode(rawInput: string, onlyAlnum: boolean = false): HuffmanResult {
    let filteredText = '';
    for (let i = 0; i < rawInput.length; i++) {
      const char = rawInput[i];
      if (!onlyAlnum || /[a-zA-Z0-9]/.test(char)) {
        filteredText += char;
      }
    }

    if (filteredText.length === 0) {
      return {
        empty: true,
        filteredText: '',
        originalLength: 0,
        uniqueSymbols: 0,
        encodedBitString: '',
        codes: {},
        frequencies: {},
        tree: null,
        isSingleChar: false,
        metrics: this.calculateMetrics('', {}, {}, ''),
      };
    }

    // 1. Calculate symbol frequencies
    const freqMap: Record<string, number> = {};
    for (let i = 0; i < filteredText.length; i++) {
      const char = filteredText[i];
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    const uniqueKeys = Object.keys(freqMap);

    // 2. Handle single unique character degenerate case
    if (uniqueKeys.length === 1) {
      const singleChar = uniqueKeys[0];
      const count = freqMap[singleChar];
      const rootNode = new HuffmanNode(singleChar, count);
      const codes: Record<string, string> = { [singleChar]: '0' };
      const encodedBitString = '0'.repeat(count);
      const tree = this.serializeTree(rootNode);

      return {
        empty: false,
        filteredText,
        originalLength: filteredText.length,
        uniqueSymbols: 1,
        encodedBitString,
        codes,
        frequencies: freqMap,
        tree,
        isSingleChar: true,
        metrics: this.calculateMetrics(filteredText, freqMap, codes, encodedBitString),
      };
    }

    // 3. Build BST-based priority queue
    const pq = new BSTPriorityQueue();
    // Sort keys or insert in consistent deterministic order
    for (const ch of uniqueKeys) {
      pq.insert(new HuffmanNode(ch, freqMap[ch]));
    }

    // 4. Merge nodes until one root remains
    let rootTree: HuffmanNode | null = null;
    while (!pq.isEmpty()) {
      const left = pq.extractMin();
      if (!left) break;

      if (pq.isEmpty()) {
        rootTree = left;
        break;
      }

      const right = pq.extractMin();
      if (!right) {
        rootTree = left;
        break;
      }

      const parent = new HuffmanNode('', left.freq + right.freq, left, right);
      pq.insert(parent);
    }

    // 5. Generate prefix codes
    const codes: Record<string, string> = {};
    if (rootTree) {
      this.generateCodes(rootTree, '', codes);
    }

    // 6. Encode full bitstring
    let encodedBitString = '';
    for (let i = 0; i < filteredText.length; i++) {
      const ch = filteredText[i];
      encodedBitString += codes[ch] || '';
    }

    const serializedTree = this.serializeTree(rootTree);
    const metrics = this.calculateMetrics(filteredText, freqMap, codes, encodedBitString);

    return {
      empty: false,
      filteredText,
      originalLength: filteredText.length,
      uniqueSymbols: uniqueKeys.length,
      encodedBitString,
      codes,
      frequencies: freqMap,
      tree: serializedTree,
      isSingleChar: false,
      metrics,
    };
  }

  /**
   * Decode bitstring using the generated code table or tree
   */
  public static decode(bitString: string, codes: Record<string, string>): { decodedText: string; isLossless: boolean } {
    if (!bitString) return { decodedText: '', isLossless: true };

    // Reverse lookup map: code -> symbol
    const reverseMap: Record<string, string> = {};
    for (const [char, code] of Object.entries(codes)) {
      reverseMap[code] = char;
    }

    let decodedText = '';
    let buffer = '';

    for (let i = 0; i < bitString.length; i++) {
      buffer += bitString[i];
      if (reverseMap[buffer] !== undefined) {
        decodedText += reverseMap[buffer];
        buffer = '';
      }
    }

    return {
      decodedText,
      isLossless: buffer.length === 0,
    };
  }

  /**
   * Format table rows for user display
   */
  public static getSymbolTable(result: HuffmanResult): SymbolTableEntry[] {
    if (result.empty || !result.filteredText) return [];

    const entries: SymbolTableEntry[] = [];
    const totalChars = result.filteredText.length;

    for (const [sym, count] of Object.entries(result.frequencies)) {
      const code = result.codes[sym] || '';
      let displaySymbol = sym;
      if (sym === ' ') displaySymbol = '␣ (space)';
      else if (sym === '\n') displaySymbol = '↵ (newline)';
      else if (sym === '\t') displaySymbol = '⇥ (tab)';
      else if (sym === '\r') displaySymbol = '␍ (cr)';

      entries.push({
        symbol: sym,
        displaySymbol,
        charCode: sym.charCodeAt(0),
        frequency: count,
        percentage: (count / totalChars) * 100,
        code,
        codeLength: code.length,
        totalBits: count * code.length,
      });
    }

    // Default sort by frequency descending
    return entries.sort((a, b) => b.frequency - a.frequency || a.symbol.localeCompare(b.symbol));
  }
}
