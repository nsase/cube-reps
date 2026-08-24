# CubeStride

<p align="center">
  <img src="public/cube-stride-mark.svg" alt="CubeStride logo" width="96" height="96">
</p>

**English** | [日本語](README.ja.md)

CubeStride is a browser-based Rubik's Cube timer and training app for full solves, OLL, and PLL. Solve records and preferences are stored in your browser, so no account or server connection is required.

[Open CubeStride](https://nsase.github.io/cube-stride/)

## Features

- Timers for full solves, OLL, and PLL
- Random-state scrambles with a cube net preview
- Searchable references for all 57 OLL cases and 21 PLL cases
- Case-specific drills with scrambles for the selected case
- Add, delete, copy, and favorite algorithms
- Create, rename, and delete record groups
- Statistics for best, overall average, Ao5, Ao12, Ao50, and Ao100
- `+2` and `DNF` penalties for solve records
- English and Japanese interfaces
- Responsive layouts for desktop, tablet, and mobile devices

## Using the timer

Use the space bar with a keyboard or the on-screen timer on a touch device.

1. Hold the space bar or timer until it enters the ready state.
2. Release it to start timing.
3. Press again while the timer is running to stop and save the solve.

After stopping, you can apply a penalty, delete the latest solve, or retry the same scramble.

## Setup

Install Node.js and npm, then run the following commands in the repository:

```bash
npm install
npx playwright install chromium
npm start
```

The development server normally starts at [http://localhost:4200](http://localhost:4200).

## Development commands

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `npm start`               | Start the development server      |
| `npm run build`           | Create a production build         |
| `npm test`                | Run tests with Vitest             |
| `npm run test:e2e`        | Run browser tests with Playwright |
| `npm run prettier:format` | Format the project with Prettier  |

Build output is written to `dist/cube-stride`.

## Data storage

The following data is stored in your browser's `localStorage`:

- Solve records and penalties
- Record groups and the active record destination
- Custom and favorite OLL and PLL algorithms
- Display language

Data is tied to the browser and origin in use. Clearing the site's browser data also deletes CubeStride records. Cloud synchronization and data export are not currently available.

## Technology

- Angular 21
- Angular Material
- Angular Signals / Signal Store
- Transloco
- Vitest
- Playwright
- SCSS

Each page uses standalone components and route-level lazy loading. Persistent application data is managed by root services, while temporary timer and history state is managed by screen-scoped Signal Stores.

## Project structure

```text
src/app/
├── core/       # Cube logic, statistics, algorithms, and persistent data
├── features/   # Timer, algorithm library, and history pages
└── shared/     # Shared UI such as cube views and confirmation dialogs
```

## License

CubeStride is available under the [0BSD (Zero-Clause BSD) License](LICENSE). You may use, copy, modify, and redistribute it for personal or commercial purposes.
