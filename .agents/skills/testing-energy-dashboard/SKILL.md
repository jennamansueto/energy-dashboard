# Testing Energy Dashboard

## Running the App Locally

```bash
cd ~/repos/energy-dashboard
npm install
npx vite --port 5173
```

The dev server will start on http://localhost:5173/ (Vite auto-increments the port if occupied).

## Lint & Build Checks

```bash
npm run lint
npm run build
```

Run these before every commit. The project uses ESLint with TypeScript and React plugins.

## Font Verification

The app uses **Inter** from Google Fonts. To verify font loading:

1. Open the app in the browser
2. In DevTools console, run:
   - `document.fonts.check('1em Inter')` — should return `true`
   - `getComputedStyle(document.querySelector('h1')).fontFamily` — should contain `Inter`
3. If font isn't loading, check:
   - `index.html` has Google Fonts `<link>` tags with preconnect
   - `src/index.css` has `body { font-family: 'Inter', sans-serif; }` in `@layer base`
   - `tailwind.config.js` has `fontFamily: { sans: ['Inter', ...] }`

**Common pitfall**: Using Tailwind's arbitrary value syntax `font-['Inter']` does NOT load the font file — it only sets the CSS property. You must import the font via Google Fonts or similar and configure Tailwind's `fontFamily` theme.

## Component Testing

Key components to verify visually:
- **Metric cards**: 4 cards (KVA, KWH, KVAR, PF) with status badges and trend indicators
- **DeviceStatusRow**: Renders device name, status badge (green for Online, gray for Idle), and consumption
- **Donut chart**: Energy consumption distribution with interactive tooltips
- **Line chart**: Max vs Actual Demand with stat boxes and analysis table

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 with tailwindcss-animate plugin
- Recharts for charts (PieChart, LineChart)
- Lucide React for icons
