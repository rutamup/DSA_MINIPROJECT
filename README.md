# Huffman Compression Visualizer

A polished, responsive, and shippable Huffman Coding web application and metrics dashboard. The application implements an optimal variable-length prefix coding algorithm based on a deterministic **Binary Search Tree (BST) Min-Priority Queue**, faithfully reproducing the exact C++ algorithm and tie-breaking behavior.

![Huffman Compression Visualizer Screenshot](/home/rutam/.gemini/antigravity-ide/brain/232b27fe-4e05-42c4-8a6a-47e3dae03a4e/huffman_app_screenshot.png)

---

## 🌟 Key Features

1. **Side-by-Side Hero Comparison**
   - **Original Size**: Calculates total bits (at 8 bits/character), byte equivalent, and displays an uncompressed baseline bar.
   - **Huffman Encoded**: Calculates total variable-length bits and scales proportionally against the original.
   - **Bits Saved Badge**: Prominent animated counter displaying bits saved (`+65 bits` on `abracadabra`), space savings percentage (`73.9% Saved`), and compression ratio (`3.83x`).

2. **Compression & Information Theory Dashboard**
   - **Compression Ratio** ($L_{\text{orig}} / L_{\text{comp}}$)
   - **Space Savings %** ($(1 - L_{\text{comp}} / L_{\text{orig}}) \times 100$)
   - **Average Code Length** ($\sum p_i \cdot \ell_i$ in bits/symbol)
   - **Shannon Entropy** ($H(X) = -\sum p_i \log_2 p_i$)
   - **Coding Efficiency** ($\eta = H(X) / L_{\text{avg}}$)
   - **Redundancy** ($R = L_{\text{avg}} - H(X)$)
   - **Fixed-Length Comparison** ($\lceil\log_2(\text{unique symbols})\rceil$)
   - **Code-Table Overhead Toggle**: Accurately computes real-world transmission overhead when serializing the symbol codebook header ($8\text{ bits} + \sum [8 + 5 + \ell_i]$).

3. **Interactive Visualizations & Analytics**
   - **Interactive SVG Huffman Tree Diagram**:
     - Leaf nodes indicate symbol and frequency in emerald badges.
     - Internal nodes indicate combined subtree frequencies.
     - Edges labeled with binary paths (`0` on left branch, `1` on right branch).
     - Hovering any row in the code table dynamically highlights the corresponding tree traversal path.
   - **Symbol Frequency & Weight Chart**: Bar distribution of symbol counts.
   - **Code Length per Symbol Chart**: Visual demonstration that frequent symbols receive shorter bit codes.
   - **Footprint Comparison**: Visual comparison between Uncompressed Baseline vs Fixed-Length Coding vs Optimal Huffman Coding.

4. **Sortable Symbol Codebook Table**
   - Multi-column sortable table (Symbol, Frequency, Weight %, Huffman Prefix Code, Code Length, Bits Contributed).
   - Display representations for whitespace: spaces rendered as `␣ (space)`, newlines as `↵ (newline)`, and tabs as `⇥ (tab)`.

5. **Encoded Output & Lossless Verification**
   - Full copyable binary stream in monospace formatting.
   - **"Verify Lossless Decode"**: Reconstructs the original text by traversing the prefix codebook, verifying bit-for-bit lossless equality, triggering a celebratory animation, and confirming data integrity.
   - One-click export of data and codebook in **JSON** and **TXT** formats.

6. **Edge Cases Handled**
   - **Empty text**: Clean empty state without crashes.
   - **Single unique character** (e.g. `aaaa`): Assigns code `"0"` per specification with a clear degenerate-case indicator.
   - **Large text (>100k characters)**: Automatically offloads computation to a Web Worker (`src/workers/huffman.worker.ts`) to ensure 60fps UI responsiveness.
   - **Unicode & Multibyte Symbols**: Seamless character code handling and codebook generation.

---

## 🛠️ Architecture & Core Algorithm

The core algorithm is implemented in two formats with identical logic and tie-breaking:
- **C++ Reference**: [cpp/huffman.cpp](file:///home/rutam/Documents/dsaminiproj/cpp/huffman.cpp)
  - Features `HuffmanNode`, a custom `BSTPriorityQueue` (`insert` and `extractMin`), and JSON serialization.
  - Can be compiled natively with `g++ -std=c++17 cpp/huffman.cpp -o cpp/huffman` or with Emscripten (`emcc`).
- **TypeScript Core**: [src/core/huffman.ts](file:///home/rutam/Documents/dsaminiproj/src/core/huffman.ts)
  - Faithful port matching the C++ BST priority queue, node structure, and tree serialization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation
```bash
npm install
```

### Run Locally (Development)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Unit Tests
```bash
npx vitest run
```
All unit tests verify:
- Exact BST PQ outputs matching C++ ("abracadabra")
- Single unique character degenerate cases ("aaaa")
- Empty string safety
- Alnum character filter (`isalnum`)
- Shannon entropy vs average code length bounds
- Lossless round-trip decode verification

### Production Build
```bash
npm run build
```
The output is generated in `./dist/` as a static bundle ready to deploy on **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 📄 License
MIT
