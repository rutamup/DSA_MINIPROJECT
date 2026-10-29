import { describe, it, expect } from 'vitest';
import { Huffman } from './huffman';

describe('Huffman Coding Core Algorithm Tests', () => {
  it('handles "abracadabra" accurately matching C++ BST PQ output', () => {
    const input = 'abracadabra';
    const result = Huffman.encode(input, false);

    expect(result.empty).toBe(false);
    expect(result.originalLength).toBe(11);
    expect(result.uniqueSymbols).toBe(5);

    // Frequencies: a:5, b:2, r:2, c:1, d:1
    expect(result.frequencies['a']).toBe(5);
    expect(result.frequencies['b']).toBe(2);
    expect(result.frequencies['r']).toBe(2);
    expect(result.frequencies['c']).toBe(1);
    expect(result.frequencies['d']).toBe(1);

    // Verify sum(freq * codeLength) equals encodedBitString length
    let sumBits = 0;
    for (const [sym, count] of Object.entries(result.frequencies)) {
      sumBits += count * result.codes[sym].length;
    }
    expect(result.encodedBitString.length).toBe(sumBits);
    expect(result.metrics.compressedBits).toBe(sumBits);

    // Check round-trip decoding
    const { decodedText, isLossless } = Huffman.decode(result.encodedBitString, result.codes);
    expect(isLossless).toBe(true);
    expect(decodedText).toBe(input);

    // Verify original bits = 11 * 8 = 88
    expect(result.metrics.originalBits).toBe(88);
    expect(result.metrics.bitsSaved).toBe(88 - sumBits);
    expect(result.metrics.bitsSaved).toBeGreaterThan(0);
  });

  it('handles single unique character degenerate case "aaaa"', () => {
    const input = 'aaaa';
    const result = Huffman.encode(input, false);

    expect(result.empty).toBe(false);
    expect(result.isSingleChar).toBe(true);
    expect(result.uniqueSymbols).toBe(1);
    expect(result.codes['a']).toBe('0');
    expect(result.encodedBitString).toBe('0000');
    expect(result.metrics.compressedBits).toBe(4);
    expect(result.metrics.originalBits).toBe(32);

    const { decodedText, isLossless } = Huffman.decode(result.encodedBitString, result.codes);
    expect(isLossless).toBe(true);
    expect(decodedText).toBe(input);
  });

  it('handles empty input cleanly without crashing', () => {
    const input = '';
    const result = Huffman.encode(input, false);

    expect(result.empty).toBe(true);
    expect(result.originalLength).toBe(0);
    expect(result.encodedBitString).toBe('');
    expect(result.tree).toBeNull();
    expect(result.metrics.originalBits).toBe(0);
    expect(result.metrics.compressedBits).toBe(0);
  });

  it('handles alnum filter option correctly', () => {
    const input = 'Hello, World! 123';
    const resultAll = Huffman.encode(input, false);
    const resultAlnum = Huffman.encode(input, true);

    expect(resultAll.originalLength).toBe(17);
    expect(resultAlnum.originalLength).toBe(13); // Letters and digits only
    expect(resultAlnum.frequencies[' ']).toBeUndefined();
    expect(resultAlnum.frequencies[',']).toBeUndefined();
    expect(resultAlnum.frequencies['!']).toBeUndefined();

    const { decodedText } = Huffman.decode(resultAlnum.encodedBitString, resultAlnum.codes);
    expect(decodedText).toBe('HelloWorld123');
  });

  it('supports lossless round trip for complex text and sentences', () => {
    const input = 'The quick brown fox jumps over the lazy dog 1234567890! #$*';
    const result = Huffman.encode(input, false);

    const { decodedText, isLossless } = Huffman.decode(result.encodedBitString, result.codes);
    expect(isLossless).toBe(true);
    expect(decodedText).toBe(input);

    // Verify entropy <= average code length (Shannon source coding theorem)
    expect(result.metrics.avgCodeLength).toBeGreaterThanOrEqual(result.metrics.entropy - 0.0001);
  });
});
