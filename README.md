# AltairLab

AltairLab is a browser app for practising Python Altair. Each exercise shows a target chart. You write Altair code in the editor, the app runs it in Pyodide (Python in WebAssembly), and it checks your chart against the target. A sandbox lets you try Altair on built-in datasets or on a CSV you upload. Progress and code are saved in your browser's localStorage.

## Setup

Run `npm ci`, then `npm run dev` to start the dev server.

## Scripts

- `npm test` runs the unit tests (`vitest run`).
- `npm run test:py` runs every exercise solution through Pyodide and checks that it solves its own target.
- `npm run test:gen` runs the exercise generator's output through Pyodide.
- `npm run targets` rebuilds the target chart specs in `src/content/targets.json`. Rerun it after editing an exercise solution.

The Pyodide scripts download Python packages on first run, so they take a few minutes.

## Deploy

`npm run build` produces the static site, which is published to GitHub Pages at https://feal-ca.github.io/altair-lab/. Pushes to `main` deploy through `.github/workflows/deploy.yml`.
