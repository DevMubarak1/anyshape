# AnyShape

> Crop images to any shape - Free, open-source, and privacy-first

## Features

- **16+ Preset Shapes** - Circle, heart, star, hexagon, triangle, and many more
- **Custom Shape Editor** - Create your own shapes using:
  - Shape Generator (polygons & stars with customizable sides/points)
  - SVG Path Editor (paste any SVG path)
  - Freehand Drawing tool
- **Privacy-First** - All processing happens in your browser. No uploads, no servers
- **High-Quality Export** - Download as transparent PNG in 256px, 512px, 1024px, or 2048px
- **No Watermarks** - 100% free with no hidden limitations
- **No Sign-up Required** - Just open and use
- **Dark Mode** - Automatic theme detection
- **Mobile Friendly** - Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DevMubarak1/anyshape.git
cd anyshape
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript

## 📁 Project Structure

```text
anyshape/
├── app/
│   ├── components/
│   │   ├── shapes.ts           # Shape definitions and generators
│   │   ├── ImageCropper.tsx    # Main cropping component
│   │   ├── ShapeSelector.tsx   # Shape selection grid
│   │   ├── CustomShapeEditor.tsx # Custom shape creation modal
│   │   ├── Header.tsx          # Header component
│   │   └── Footer.tsx          # Footer component
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── public/                     # Static assets
├── package.json
└── README.md
```

## How It Works

1. **Choose a Shape** - Select from preset shapes or create your own
2. **Upload an Image** - Drag & drop or click to browse
3. **Adjust Position** - Drag to reposition, scroll to zoom
4. **Download** - Export as transparent PNG

## Adding Custom Shapes

### Using the Shape Generator

1. Click "+ Custom Shape" button
2. Choose "Generator" mode
3. Select polygon or star type
4. Adjust sides/points and other parameters
5. Click "Use This Shape"

### Using SVG Path

1. Click "+ Custom Shape" button
2. Choose "SVG Path" mode
3. Paste your SVG path data (coordinates should be 0-100)
4. Click "Use This Shape"

Example SVG path for a diamond:

```text
M 50 0 L 100 50 L 50 100 L 0 50 Z
```

### Using Freehand Drawing

1. Click "+ Custom Shape" button
2. Choose "Draw" mode
3. Click and drag to draw your shape
4. The shape will automatically close
5. Click "Use This Shape"

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- Add more preset shapes
- Color overlay options
- Image filters (blur, brightness, etc.)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).



## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

Made with ❤️ by DevMubarak
