import { Huffman } from '../core/huffman';
import type { HuffmanResult } from '../types/huffman';

export interface WorkerRequest {
  id: number;
  text: string;
  onlyAlnum: boolean;
}

export interface WorkerResponse {
  id: number;
  result: HuffmanResult;
  durationMs: number;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, text, onlyAlnum } = e.data;
  const startTime = performance.now();
  const result = Huffman.encode(text, onlyAlnum);
  const durationMs = performance.now() - startTime;

  self.postMessage({ id, result, durationMs } as WorkerResponse);
};
