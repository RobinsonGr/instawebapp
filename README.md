# InstaStore Web

A small demo UI for the InstaStore API. Click anywhere on the map (or use your current location) to find the closest store, see whether it's open, and get its coordinates.

![InstaStore screenshot](docs/screenshot.png)

<!-- TODO: add a screenshot at docs/screenshot.png -->

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

With `VITE_USE_MOCK=true` (the default in `.env.example`) the app works without a backend. Set it to `false` and point `VITE_API_URL` at a running InstaStore API to use real data.

## Environment variables

| Variable        | Description                                                                   | Example                 |
| --------------- | ----------------------------------------------------------------------------- | ----------------------- |
| `VITE_API_URL`  | Base URL of the InstaStore API.                                               | `http://localhost:3000` |
| `VITE_USE_MOCK` | `true` returns a fake store near the chosen point instead of calling the API. | `true`                  |

Vite reads these at build time, so restart the dev server after changing them.

## Scripts

| Command                | What it does                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload. |
| `npm run build`        | Type-check and build to `dist/`.      |
| `npm run preview`      | Serve the production build locally.   |
| `npm run lint`         | Run ESLint.                           |
| `npm run format`       | Format the code with Prettier.        |
| `npm run format:check` | Check formatting without writing.     |

## API

The app calls one endpoint:

```
GET {VITE_API_URL}/stores/closest?lat={number}&lng={number}
```

- `200` → `{ "storeId": string, "storeName": string, "isOpen": boolean, "coordinates": { "lat": number, "lng": number } }`
- `400` → invalid coordinates
- `404` → no store nearby

## Notes

- "Use my location" needs a secure context: `localhost` or HTTPS. If permission is denied, the app explains why and you can still click the map.
- Map tiles come from OpenStreetMap.
