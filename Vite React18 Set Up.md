# openRetic-PWA Scaffolding Guide

This document provides a **fail-proof method** to scaffold a PWA using:

- Vite
- React 18.2
- Tailwind CSS 3.4.1
- shadcn-ui

---

## ✅ Prerequisites

Ensure you have installed:

- Node.js (v16+)
- npm (v8+)
- Git (optional, but recommended)

---

## 🛠️ Step-by-Step Setup

### 1. Create the Vite + React + TypeScript Project

```bash
npm create vite@latest openretic-pwa -- --template react-ts
cd openretic-pwa
```

> **Important:** When prompted for **Package Name**, enter **all lowercase**, e.g., `openretic-pwa`.

### 2. Install Base Dependencies

```bash
npm install
```

### 3. Downgrade React to 18.2

Force install the correct React version:

```bash
npm install react@18.2.0 react-dom@18.2.0
```

### 4. Downgrade TypeScript Types for React 18

```bash
npm install -D @types/react@18.2.22 @types/react-dom@18.2.7
```

### 5. Install and Configure Tailwind CSS

```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js` to:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Update `src/index.css` to:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6. Setup Path Aliases

Modify `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Install Node types:

```bash
npm install -D @types/node
```

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 7. Initialize shadcn-ui

Run:

```bash
npx shadcn@latest init
```

Answer prompts as follows:

- **Global CSS file**: `src/index.css`
- **Tailwind config path**: `tailwind.config.js`
- **Import alias for components**: `@/components`
- **Import alias for utils**: `@/lib/utils`
- **Use CSS variables for colors**: `Yes`
- **React Server Components**: `No`

### 8. Add Your First shadcn Component (Example)

```bash
npx shadcn@latest add button
```

---

## 🔄 Verify the Setup

1. Run the development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. You should see your new Vite + React 18 + Tailwind + shadcn PWA project running without errors.

---

## 🔹 Notes

- Always use lowercase names for npm packages.
- Stick with **React 18.2** for maximum compatibility.
- If shadcn CLI throws warnings about React 19, ignore them if you've already forced React 18.
- Keep `tailwind.config.js` as CommonJS (`module.exports = {}`) during setup.

---

**Document Last Updated:** April 29, 2025

