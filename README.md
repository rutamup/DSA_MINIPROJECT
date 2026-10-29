# Hoffman Compression Visualizer

A responsive React and TypeScript application that visualizes Huffman coding in real time. It converts text into prefix codes, displays the generated Huffman tree, and compares original storage size with compressed size.

## Features

- Live Huffman encoding as text is entered or changed
- Original bits, Huffman encoded bits, and bits saved comparison
- Compression ratio, space savings, and average code length metrics
- Fixed-length versus Huffman comparison
- Interactive SVG Huffman tree representation
- Binary branches labeled `0` and `1`
- Leaf nodes showing symbols and frequencies
- Internal nodes showing combined frequencies
- Built-in text samples and an alphanumeric-only input option
- Empty-input and single-symbol handling
- Web Worker support for large inputs
- Dark, continuous visual layout

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Web Workers
- C++ reference implementation

## Project Structure

```text
src/
├── components/       React UI components and tree visualization
├── core/             TypeScript Huffman encoding implementation
├── types/            Shared TypeScript types
├── workers/          Background worker for large inputs
└── App.tsx           Main application layout
cpp/
└── huffman.cpp       C++ Huffman coding reference implementation
public/
└── favicon.svg       Website logo and browser icon
```

## Run Locally

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Development server

```bash
npm run dev
```

Open the local address shown by Vite, usually `http://localhost:5173`.

### Production build

```bash
npm run build
```

The deployable static files are written to the `dist` directory.

### Preview the production build

```bash
npm run preview
```

## Deploy to Vercel

### GitHub deployment

1. Push the project to GitHub.
2. Sign in to [Vercel](https://vercel.com) and select **Add New → Project**.
3. Import the GitHub repository.
4. Confirm the detected settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Select **Deploy**.

Every push to the connected production branch can trigger a new deployment.

### Vercel CLI deployment

```bash
npx vercel login
npx vercel
npx vercel --prod
```

The included `vercel.json` configures the Vite build and serves the application correctly for client-side routes.

## Metrics

- **Original bits:** Number of characters × 8
- **Huffman encoded bits:** Sum of each Huffman code length multiplied by the symbol frequency
- **Bits saved:** Original bits minus Huffman encoded bits
- **Compression ratio:** Original bits divided by Huffman encoded bits
- **Space savings:** Percentage reduction from the original bit count
- **Average code length:** Encoded bits divided by the number of input characters
- **Fixed-length bits:** Number of characters × bits required to represent all unique symbols

## Input Behavior

- Empty input produces a ready state and hides compression results.
- A single unique symbol receives a one-bit code per occurrence.
- When **Only letters & digits (isalnum)** is enabled, spaces, punctuation, and symbols are filtered out.
- Inputs longer than 15,000 characters are processed through a Web Worker when supported.

## License

MIT
