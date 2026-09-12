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
- Optional Google sign-in, confirmation-based guest record import, and cross-device solve synchronization
- Responsive layouts for desktop, tablet, and mobile devices, with a 16px base font and larger scramble and supporting text

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

## Settings

Open **Settings** at the bottom of the sidebar (in the bottom navigation on mobile) to select English or Japanese. On the first visit, Japanese is selected for a Japanese browser language; otherwise English is used. The language applies throughout the app and is saved in this browser for the next visit; existing language preferences are preserved.

Select **Check for updates** to check for a new version. Settings displays checking, latest-version, update-available, and failure states. If an update is ready, select **Update now** to reload the app with the new version, even if you previously dismissed the update notification. A failed check or update can be retried. Update checking is unavailable in development builds and browsers without Service Worker support; Settings explains this instead of showing a latest-version result.

## Google account sign-in

Open the profile icon in the header, select **Sign in**, then choose **Sign in with Google** on the login page. The profile popup shows your name, email address, and **Sign out** when signed in, or **Guest account** when signed out. Signing in is optional: Timer, History, and locally saved algorithms remain available without an account, including while offline after the app has been loaded.

History displays all undeleted solves saved in this browser profile, regardless of sign-in or account ownership. The owner filter applies consistently to the list, counts, statistics, and Progress Chart within the selected group and category. Owner avatars show a photo, initials, or a fallback icon; hover over an avatar for its tooltip, or open the solve details with the information button to view account details.

Guest records are **Not linked to an account** and have no guest ID. Existing guest IDs are removed without changing solve IDs or group associations. Signing in does not automatically import records. Select records in History, then confirm **Move to current account** for unlinked records or **Copy to current account** for another account's records. The **Move all guest records** button is enabled when guest records exist and moves all of them after confirmation, across all groups, categories, filters, and pages, without selecting individual records. It does not open a prompt on sign-in. Moving preserves the solve ID; copying creates an independent ID and keeps the original unchanged. Deliberately copying again creates another independent record. Check the header for cloud synchronization status.

Account-owned solves are fetched when signing in, opening History, and returning online. Adds, penalty and group changes, and deletions are applied locally immediately and queued by Firestore while offline. The header shows syncing, synced, offline, pending, or error status; failed operations can be retried. Firestore's persistent web cache is enabled and should be used only on a trusted device.

Account-owned groups also synchronize their names and deletions. When an account-owned solve is added to a guest group, or a guest solve in that group is moved to an account, the existing group becomes owned by that account without creating another group. Unselected guest solves keep their ownership and group association. The group panel shows each custom group’s owner avatar. Solve `createdAt` is the measurement time and remains unchanged by moves and copies; legacy `date` values migrate without changing that time.

On sign-in, opening History, and returning online, CubeReps retrieves the server group list before solves. Only after both reads succeed are missing group references moved to Unclassified for the current account. Failed reads preserve existing associations; guest and other accounts’ records are not reclassified based on this account’s missing groups.

Cloud deletions remain permanent tombstones. Once a deletion is received or its upload succeeds, the corresponding solve or group is removed from both the application Store and IndexedDB. Unsent deletions remain stored for offline retry. Startup also removes synced tombstones retained by older versions. Normal device switching and offline recovery are supported; simultaneous additions and deletions by the same account on multiple devices are outside the supported consistency guarantees.

Signing out retains all local history. Records belonging to other accounts remain viewable but cannot be edited or deleted until that account signs in. Group changes that would modify those records are also disabled. Owner filters only read local data; Firestore reads and writes remain restricted to the currently signed-in UID. No other account's records are uploaded automatically.

A separate IndexedDB account directory stores display names, email addresses, profile images, and provider identifiers by Firebase UID, never passwords or tokens. This browser profile's previous account records and display information are visible to anyone using it. Before handing over a shared device, sign out and clear the site's browser data after ensuring needed records have synced. Ordinary sign-out does not delete local or cloud records.

## Setup

Install Node.js and npm, then run the following commands in the repository:

```bash
npm install
npx playwright install chromium
npm run start:local
```

The final command starts the development server and local Firestore Emulator together. The development server normally starts at [http://localhost:4200](http://localhost:4200) and development builds connect to the local Firestore Emulator at `127.0.0.1:8080`. Production builds continue to connect to the production Firestore database. This separation prevents local development operations from changing production solves.

The Firebase Web configuration in `src/app/core/auth/firebase.config.ts` contains public identifiers used by the browser to connect to the CubeReps Firebase project. Do not add service-account JSON files, private keys, access tokens, or other administrator credentials to the frontend or repository; the browser application does not require them.

Firestore development requires Java 21 or later. `npm run test:firestore` starts the Firestore Emulator with the local-only `demo-cube-reps` project ID and verifies CRUD operations and Security Rules without connecting to production data. Rules and indexes are managed in `firestore.rules`, `firestore.indexes.json`, and `firebase.json`. To publish them, first confirm the target Firebase project and then run `firebase deploy --only firestore:rules,firestore:indexes`.

## Development commands

| Command                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| `npm start`               | Start the development server                 |
| `npm run start:firestore` | Start the local Firestore Emulator           |
| `npm run start:local`     | Start both development services              |
| `npm run build`           | Create a production build                    |
| `npm test`                | Run tests with Vitest                        |
| `npm run test:firestore`  | Test Firestore with the Emulator             |
| `npm run test:e2e:pr`     | Run desktop-wide browser tests for Issue PRs |
| `npm run test:e2e`        | Run all 7 Playwright projects                |
| `npm run prettier:format` | Format the project with Prettier             |

Local verification uses `npm test` (unit and component tests) and `git diff --check`. Builds, Firestore Emulator tests, and browser tests run in CI; do not run browser tests locally. PRs targeting `develop` run `npm run test:e2e:pr` (desktop-wide); release PRs targeting `main` require all 7 projects with `npm run test:e2e`. CI also runs build, unit tests, and Firestore Emulator tests for both. For UI, layout, or responsive changes needing additional viewport coverage, shared style changes, or unclear impact, run the CI workflow manually with `browser_scope: all` and record the scope and results in the PR. Manual CI also accepts `browser_scope: pr` for Issue PR coverage. All required CI checks must pass before merging.

Build output is written to `dist/cube-reps`.

## Data storage

The following synchronization-ready user data is stored in your browser's `IndexedDB`:

- Solve records and penalties
- Record groups
- Custom and favorite OLL and PLL algorithms

Existing data previously stored in `localStorage` is migrated automatically when the app starts. The following device-specific settings remain in `localStorage`:

- Active record destination
- Display language

Data is tied to the browser and origin in use. Clearing the site's browser data deletes local guest records and cached account records. Data export is not currently available.

After explicit confirmation, guest import writes to the signed-in user’s `users/{userId}/solves/{solveId}` documents. Repeating, retrying, and later synchronization do not duplicate records because the fixed solve UUID is used as the document ID. Timer, History, and statistics use the combined local cache and the latest account data fetched at synchronization points while signed in.

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

Each page uses standalone components and route-level lazy loading. The root `SettingsStore` manages persistent browser settings, including language; the settings page separates language and update controls into child components. Persistent application data is managed by root services, while temporary timer and history state is managed by screen-scoped Signal Stores.

The shared Angular Material theme and application color variables are defined in `src/styles/_material-theme.scss`. Material component colors should be customized through that theme instead of being overridden in individual component styles.

## Project structure

```text
src/app/
├── core/       # Cube logic, statistics, algorithms, and persistent data
├── features/   # Timer, algorithm library, history, and settings pages
└── shared/     # Shared UI such as cube views and confirmation dialogs
```

## License

CubeReps is available under the [0BSD (Zero-Clause BSD) License](LICENSE). You may use, copy, modify, and redistribute it for personal or commercial purposes.
