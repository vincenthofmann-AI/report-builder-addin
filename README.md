# Report Builder Add-In

MyGeotab Add-In for building custom reports with an insight-first workflow.

## Overview

The Report Builder provides a template-driven interface for creating fleet reports. It follows Geotab's IA principles: **users ask for insights, not records**.

**Live URL**: https://vincenthofmann-ai.github.io/report-builder-addin/

**Key Features**:
- 🎯 **Insight-First UX** - Browse reports by business question (Safety, Cost Savings, Fleet Health)
- 📊 **Pre-Configured Templates** - Top 20 reports with usage data from 5,000+ fleets
- ⚡ **Live Data** - Real-time MyGeotab API integration
- 💾 **Save & Schedule** - Store configurations and automate delivery
- 📈 **Visualizations** - Charts (bar, line, pie) with Recharts
- 🎨 **Zenith Design System** - Consistent with MyGeotab platform

## Architecture

The app follows a **modular architecture** organized around three workflows:

```
src/app/modules/
├── workspace/     # Template and insight discovery
├── builder/       # Data configuration and filtering
└── view/          # Report display and visualization
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for detailed documentation.

## Running the Code

### Development

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
```

### Building

```bash
npm run build      # Build for production (outputs to docs/)
npm run deploy     # Build + commit + push to GitHub Pages
```

### Project Structure

```
report-builder-addin/
├── src/app/
│   ├── modules/
│   │   ├── workspace/      # InsightCategorySelector, InsightSelector
│   │   ├── builder/        # ReportOutline, FilterBar, DataSourceSelector
│   │   └── view/           # ReportPreview, ReportTable, ChartView, ReportActions
│   ├── components/
│   │   ├── ui/             # Zenith primitives (shadcn/ui styled with Zenith tokens)
│   │   └── ReportBuilder.tsx
│   ├── services/
│   │   ├── zenith-adapter.ts       # Zenith design system integration
│   │   ├── data-fetcher.ts         # MyGeotab API integration
│   │   ├── report-templates.ts     # Pre-configured templates
│   │   ├── reporting-services.ts   # Save/Export/Schedule logic
│   │   └── geotab-context.tsx      # API context provider
│   └── App.tsx
├── docs/                   # Build output (GitHub Pages)
│   ├── ARCHITECTURE.md     # Architecture documentation
│   ├── INSIGHT_FIRST_REDESIGN.md  # UX redesign strategy
│   └── configuration.json  # MyGeotab add-in manifest
└── MEMORY.md              # Project conversation history
```

## Deployment

The add-in is deployed via **GitHub Pages** from the `docs/` folder.

**MyGeotab Registration**:
1. Navigate to: **Administration → System → System Settings → Add-Ins**
2. Click **Add New**
3. Configuration URL: `https://vincenthofmann-ai.github.io/report-builder-addin/configuration.json`

## Zenith Design System

**Status**: ✅ Fully integrated with `@geotab/zenith v3.5.0`

The app now uses Geotab's official Zenith design system components:

```bash
pnpm add @geotab/zenith  # Public npm package
```

**Available components**: Button, Card, Checkbox, Dialog, Dropdown, Calendar, DateRange, FiltersBar, and [140+ more](https://developers.geotab.com/zenith-storybook/)

**Styling**: Zenith CSS automatically imported in `src/main.tsx`

**Migration status**: Some components still use shadcn/ui (Radix UI primitives). Incremental migration to Zenith components ongoing. See `docs/ARCHITECTURE.md` for details.

## Documentation

- **Architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **UX Redesign**: [`docs/INSIGHT_FIRST_REDESIGN.md`](docs/INSIGHT_FIRST_REDESIGN.md)
- **Progressive Disclosure**: [`docs/PROGRESSIVE_DISCLOSURE_DESIGN.md`](docs/PROGRESSIVE_DISCLOSURE_DESIGN.md)
- **Project Memory**: [`MEMORY.md`](MEMORY.md)

## Tech Stack

- **React 18.3** + **TypeScript**
- **Vite 6.3** (build tool)
- **Radix UI** (primitives)
- **Tailwind CSS 4** (styling)
- **Recharts 2.15** (charts)
- **Motion** (animations)
- **Zenith Design Tokens** (via `zenith-adapter.ts`)

## Development Workflow

1. **Make changes** in `src/`
2. **Test locally** with `npm run dev`
3. **Build** with `npm run build`
4. **Deploy** with `npm run deploy` (commits `docs/` and pushes to GitHub)

## References

- **Zenith Storybook**: https://developers.geotab.com/zenith-storybook/
- **MyGeotab Add-In SDK**: https://developers.geotab.com/myGeotab/addIns/developingAddIns/
- **Original Figma Design**: https://www.figma.com/design/4UKmdTDVI4MKsN0CkJciDX/Interactive-Report-Builder
