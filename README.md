# Outflow — Frontend

Angular 21 client for [Outflow](https://outflow.collinkoldoff.dev), a personal budgeting app that tracks expenses, pay periods, and spending trends.

## Stack

- **Angular 21** — standalone components, signals, computed state
- **TailwindCSS v4 + DaisyUI v5** — utility-first styling with component library
- **Chart.js** — spending breakdown charts
- **Cookie-based auth** — handled by the backend; frontend reads `/auth/me` on load

## Features

- **Dashboard** — rolling 30-day expense breakdown by category, 6-month category table, stacked bar chart
- **Expenses** — inline editable table (desktop) / card layout (mobile), auto-saves on blur, sortable columns, category management modal
- **Landing page** — public-facing page with Login and View Demo CTAs
- **Dark/light theme** — toggle persisted via `data-theme` attribute
- **Demo mode** — pre-seeded read-only account, resets daily

## Local Development

Requires the [outflow-server](../outflow-server) running on `http://localhost:5257`.

```bash
npm install
npm start
```

Opens at `http://localhost:4200`. The dev server proxies `/api` and `/auth` to `localhost:5257`.

## Build

```bash
npm run build
```

Output goes to `dist/`. Production builds are deployed to a Linux server via GitHub Actions on push to `master`.

## Project Structure

```
src/app/
├── models/          TypeScript interfaces matching server DTOs
├── services/        One HttpClient service per resource + AuthService
├── navbar/          Responsive nav with mobile dropdown and theme toggle
├── footer/          Simple footer
├── landing/         Public landing page
├── dashboard/       Spending summary tables and chart
├── expenses/        Editable expense table with category modal
└── toast/           Toast notification overlay
```

## Auth Flow

1. User clicks **Login with Google** → hits `/auth/login` on the backend
2. Backend completes OAuth and sets an HttpOnly cookie
3. Angular calls `/auth/me` on startup to hydrate the user signal
4. `undefined` = loading, `null` = logged out, `UserResponse` = authenticated
5. Logged-in users visiting `/` are redirected to `/dashboard`
