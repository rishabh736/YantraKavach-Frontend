# Yantra Kavach — Industrial Predictive Maintenance Platform

React + Vite + TypeScript + Tailwind CSS front end for a retrofit IIoT / predictive-maintenance product aimed at MSMEs.
All 12 pages are implemented, driven by live telemetry once a plant API is connected (illustrative sample data is shown until then), through a central API layer.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview
```

Requires Node 18+.

## Login accounts (password `demo123`)

| Role | Email |
| --- | --- |
| Admin | admin@yantrakavach.in |
| Maintenance Manager | manager@yantrakavach.in |
| Operator | operator@yantrakavach.in |

Operators cannot open Reports or Settings; only Admins see User management and API configuration.

## Before you publish — edit `src/config/site.ts`

This one file holds your company name, contact details, credentials (Udyam, DPIIT, ISO, incubator), team and pilot results.
Anything left empty is shown on the site as **“To be added”**, so nothing is invented. Only add credentials and results you can prove.
The Privacy Policy, Terms and Accessibility pages are **drafts** — have a legal adviser review them before launch.

## Public-service style features

- White, light theme by default (dark theme available from the top bar).
- Utility bar on every page: skip to main content, text size (A− A A+), high-contrast mode, English / हिन्दी.
- Hindi covers navigation, hero and key public headings. Add more strings in `src/lib/i18n.ts` (missing ones fall back to English).
- Trust section, Contact form, Privacy, Terms and Accessibility pages.
- The site says clearly that it is an independent product and not affiliated with any government body. Do not use government emblems or wording implying official backing.

## Try this

- - Settings → **Machine thresholds**: edit a limit and watch machine status and health scores update immediately.
- Machine → **See full explanation**: WHAT / WHERE / WHY / IMPACT / ACTION with an AI confidence figure.

## Project structure

```
src/
  types.ts                 shared domain types
  lib/
    params.ts              the 5 monitored parameters, units, default thresholds
    engine.ts              status logic, health score, explainable predictions
    mock.ts                sample data generators (fallback only, used until a backend is connected)
    format.ts              helpers
  services/api.ts          central API layer (real fetch first, mock fallback)
  context/                 Plant (state + telemetry), Auth, Theme, Toast
  components/              Sidebar, Topbar, MachineCard, HealthRing, charts, Modal, ...
  pages/                   Landing, About, Login, Dashboard, Machines, MachineDetail,
                           Predictive, Alerts, Sensors, Analytics, Maintenance, Reports, Settings
```

## Connecting a real backend

Either set `VITE_API_URL=http://localhost:4000` in a `.env` file, or enter the URL in **Settings → API configuration** (Admin only).
`src/services/api.ts` calls these endpoints and falls back to mock data if they are unavailable:

```
GET  /api/machines        GET /api/machines/:id     GET /api/sensors
GET  /api/alerts          GET /api/analytics        GET /api/maintenance
GET  /api/predictions
POST /api/alerts/:id/acknowledge                    POST /api/maintenance
```

Response shapes follow the interfaces in `src/types.ts`. To replace the built-in telemetry loop with a live stream,
swap the `setInterval` in `src/context/PlantContext.tsx` for a WebSocket or polling call.

## Notes

- Routing uses `HashRouter`, so the built site works on any static host without server rewrites.
- Login is a front-end concept only; there is no real authentication until a backend is added.
- Sample data includes asset make/model/serial, work-order costs and parts, technician names, plant load in kW, OEE, MTBF and MTTR. It is replaced automatically once a real API responds.
- Fonts (IBM Plex) load from Google Fonts; the UI falls back to system fonts offline.
