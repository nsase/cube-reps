# CubeReps

<p align="center">
  <img src="public/cube-reps-mark.svg" alt="CubeReps logo" width="96" height="96">
</p>

**English** | [日本語](README.ja.md)

CubeReps is a browser-based Rubik's Cube timer and training tool. Solve records and preferences are stored in your browser, so no account or server connection is required.

[Open CubeReps](https://nsase.github.io/cube-reps/)

## Features

- Timers for full solves, OLL, and PLL
- Random-state scrambles with a cube net preview
- Searchable references for all 57 OLL cases and 21 PLL cases
- Case-specific drills with scrambles for a selected or random case
- Add, delete, copy, and favorite algorithms
- Create, rename, and delete record groups, moving their records to Unclassified on deletion, with one shared selection across timer and history
- Per-group statistics for best, overall average, Ao5, Ao12, Ao50, and Ao100
- `+2` and `DNF` penalties for solve records
- Retry any solve from history with its original scramble, category, and record group
- History rows with point-in-time Ao5/Ao12 and details for scrambles and cube previews
- English and Japanese interfaces
- Optional Google sign-in and a confirmation-based first upload of local solve records
- Responsive layouts for desktop, tablet, and mobile devices

## Using the timer

Use the space bar with a keyboard or the on-screen timer on a touch device.

1. Hold the space bar or timer until it enters the ready state.
2. Release it to start timing.
3. Press again while the timer is running to stop and save the solve.

After stopping, you can apply a penalty, delete the latest solve, or retry the same scramble.

## Install and use offline

Open [CubeReps](https://nsase.github.io/cube-reps/) once while online. In a supported desktop or Android browser, use the browser menu or install button to install the app. On iPhone and iPad, open CubeReps in Safari, tap **Share**, and select **Add to Home Screen**.

After the first online load completes, the installed app can be started and reloaded offline. Solve records, groups, and algorithm preferences remain on the device. When a new version has finished downloading online, CubeReps displays a dismissible update notification with an **Update now** action so that you can switch versions safely.

Browser storage is separated by browser and installation context. In particular, Safari and a Home Screen web app on iOS/iPadOS may not share existing data, so records created in Safari might not appear in the installed app. Installing or updating CubeReps does not itself delete browser data.

## Google account sign-in

Select **Sign in with Google** in the page header to sign in. Signing in is optional: Timer, History, and locally saved algorithms remain available without an account, including while offline after the app has been loaded.

After signing in, CubeReps compares guest-owned local solve IDs with the signed-in account’s Firestore records and shows the destination account and number of records that need uploading. Nothing is uploaded until you select **Upload**. The operation is idempotent by solve UUID, can retry only failed records after an interruption, and keeps the local records and marks successful migrations as owned by that account.

When the same UUID exists in both places with different contents, the newer `updatedAt` value wins; a higher schema version breaks timestamp ties, and the cloud copy is preserved if the conflict is still tied. Signing in does not continuously synchronize later changes, and signing out leaves local data on the device. The sign-in and sign-out operations themselves require an internet connection.

## Setup

Install Node.js and npm, then run the following commands in the repository:

```bash
npm install
npx playwright install chromium
npm start
```

The development server normally starts at [http://localhost:4200](http://localhost:4200).

The Firebase Web configuration in `src/app/core/auth/firebase.config.ts` contains public identifiers used by the browser to connect to the CubeReps Firebase project. Do not add service-account JSON files, private keys, access tokens, or other administrator credentials to the frontend or repository; the browser application does not require them.

Firestore development requires Java 21 or later. `npm run test:firestore` starts the Firestore Emulator with the local-only `demo-cube-reps` project ID and verifies CRUD operations and Security Rules without connecting to production data. Rules and indexes are managed in `firestore.rules`, `firestore.indexes.json`, and `firebase.json`. To publish them, first confirm the target Firebase project and then run `firebase deploy --only firestore:rules,firestore:indexes`.

## Development commands

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `npm start`               | Start the development server      |
| `npm run build`           | Create a production build         |
| `npm test`                | Run tests with Vitest             |
| `npm run test:firestore`  | Test Firestore with the Emulator  |
| `npm run test:e2e`        | Run browser tests with Playwright |
| `npm run prettier:format` | Format the project with Prettier  |

Build output is written to `dist/cube-reps`.

## Data storage

The following synchronization-ready user data is stored in your browser's `IndexedDB`:

- Solve records and penalties
- Record groups
- Custom and favorite OLL and PLL algorithms

Existing data previously stored in `localStorage` is migrated automatically when the app starts. The following device-specific settings remain in `localStorage`:

- Active record destination
- Display language

Data is tied to the browser and origin in use. Clearing the site's browser data also deletes CubeReps records. Continuous cloud synchronization and data export are not currently available.

The initial migration writes only to the signed-in user’s `users/{userId}/solves/{solveId}` documents after explicit confirmation. Repeating or retrying the migration does not duplicate records because the fixed solve UUID is used as the document ID. Local records remain the data used by Timer and History until continuous synchronization is implemented.

## Technology

- Angular 21
- Angular Material
- Angular Signals / Signal Store
- Transloco
- Firebase Authentication
- Cloud Firestore / Firebase Emulator Suite
- Vitest
- Playwright
- SCSS

Each page uses standalone components and route-level lazy loading. Persistent application data is managed by root services, while temporary timer and history state is managed by screen-scoped Signal Stores.

The shared Angular Material theme and application color variables are defined in `src/styles/_material-theme.scss`. Material component colors should be customized through that theme instead of being overridden in individual component styles.

## Project structure

```text
src/app/
├── core/       # Cube logic, statistics, algorithms, and persistent data
├── features/   # Timer, algorithm library, and history pages
└── shared/     # Shared UI such as cube views and confirmation dialogs
```

## License

CubeReps is available under the [0BSD (Zero-Clause BSD) License](LICENSE). You may use, copy, modify, and redistribute it for personal or commercial purposes.
