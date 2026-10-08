# InstaStore Web

A small demo UI for the InstaStore API. Pick a point and it shows the closest store, whether it's open, and its coordinates, with a dashed line from your point to the store.

![InstaStore screenshot](docs/screenshot.png)

<!-- TODO: add a screenshot at docs/screenshot.png -->

## Searching

There are three ways to choose a point:

- **Click the map.** The point is marked and its coordinates fill the latitude and longitude fields.
- **Type coordinates** in the side panel and press **Find closest store**. Latitude must be between -90 and 90 and longitude between -180 and 180; invalid values are flagged under each field before anything is sent.
- **Use my location** in the header asks the browser for your position. If permission is denied, the position is unavailable, or the request times out, the app says so and the other methods still work.

The **Medellín** (6.2442, -75.5812) and **Bogotá** (4.7110, -74.0721) buttons fill in those coordinates, move the map there and search. They also appear when no store is found nearby.

After each search the map zooms to fit both your point and the store.

On narrow screens the panel becomes a bottom sheet under the map, with the result shown above the search form.

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

In development the app calls `/api/...` on the Vite dev server, which proxies to `VITE_API_URL` (see `vite.config.ts`). This avoids CORS, since the API doesn't send CORS headers. A production build calls `VITE_API_URL` directly, so the API must either allow the app's origin or be served from the same origin.

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
- `400` → invalid coordinates (the app shows the API's message)
- `404` → no store within the search radius

## Notes

- "Use my location" needs a secure context: `localhost` or HTTPS.
- If the API can't be reached, the app says it may be waking up; try again after a few seconds.
- Map tiles come from OpenStreetMap.
