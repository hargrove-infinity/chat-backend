# chat-backend

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Running the app

```bash
npm run dev
```

This is the only command you need for local development.

## What happens when you run `npm run dev`

`onchange` starts watching all `src/**/*.ts` files for changes. On startup (`-i` flag) and on every file change it runs two steps sequentially:

1. **Lint** — Biome checks all files in `src/`. If any lint **errors** are found, the process stops and the server does not restart. Lint **warnings** do not stop the server.
2. **Build & run** — TypeScript compiles `src/` into `dist/`, then starts the server with `node dist/server.js`. If `tsc` fails, the server does not start.

The `-k` flag kills the previous server process before starting a new one, so there is never two instances running at the same time.

## Scripts reference

| Script      | Description                                           |
| ----------- | ----------------------------------------------------- |
| `dev`       | Watch `src/**/*.ts`, lint and rebuild on every change |
| `build:run` | Compile TypeScript and start the server once          |
