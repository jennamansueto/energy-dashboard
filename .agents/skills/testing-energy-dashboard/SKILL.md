# Testing the Energy Dashboard

## Overview
This is a Vite + React + TypeScript + Tailwind CSS dashboard app using Recharts for charts (donut and line). All data is static/hardcoded. The entire app is a single page.

## Dev Server Setup
1. Run `npm install` if not already done
2. Run `npm run dev` — Vite will start on port 5173 (or next available port if occupied)
3. Note: Vite may pick a different port if 5173 is in use. Check the terminal output for the actual URL.

## Key UI Elements to Verify
- **Sidebar**: 70px wide, light gray (#F1F5F4), 6 icon buttons, first one green-highlighted, "LG" avatar at bottom
- **Header**: Greeting "Hello, Liam Gallagher!" with wave emoji, subtitle, green "Real-time monitoring active" badge
- **4 Metric Cards**: Dark green gradient backgrounds, each with label, value+unit, name, status badge, and trend indicator
- **Energy Consumption Overview** (left panel): Title, "15,417" total kWh, donut chart with 6 colored segments, legend, Device Status table (3 rows)
- **Max vs Actual Demand** (right panel): Title, 3 stat boxes (Avg/Peak/Efficiency), line chart with green actual + red dashed max lines, Demand Analysis table (3 rows)

## Chart Testing
- Recharts components may take ~1 second to render after initial page load
- Donut chart: Hover directly on colored segments to trigger tooltips (shows kWh values)
- Line chart: Hover on data points or along the line to see tooltips with formatted labels ("Max Demand" / "Actual Demand" with kW units)
- If charts appear blank initially, wait a moment and refresh — Recharts needs the container to be fully measured

## Build Verification
- `npm run build` should complete with no errors
- `npm run lint` should pass cleanly
- No CI is configured on this repo

## Known Considerations
- The `DeviceStatusRow` component accepts a `status` prop but doesn't render it (only shows device name and consumption)
- Package name in package.json is `energy-dashboard-temp` (from scaffold)
- No responsive/mobile layout — desktop only
- Uses Tailwind arbitrary values extensively (e.g., `w-[70px]`, `bg-[#F1F5F4]`) to match exact Figma design tokens
- `tailwindcss-animate` must be imported statically (not via dynamic `import()`) in `tailwind.config.js`
