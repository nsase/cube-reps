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
- The Algorithms menu opens an F2L / OLL / PLL selection page. Wide screens also offer direct submenu links. Material button toggle groups switch types within each algorithm page and switch timer modes (3×3 / F2L / OLL / PLL); F2L uses the same searchable page and cards as OLL/PLL, with 41 numbered cases and groups. Custom algorithms, favorites, copying, and deletion are available; each card uses a Material button toggle group to switch between Front Right, Front Left, Back Left, and Back Right (abbreviated to FR / FL / BL / BR when the card is narrow), with built-in algorithms, custom algorithms, and favorites stored separately for each slot. Each case has one FR-based Setup; FL, BL, and BR append `y`, `y2`, and `y'` respectively. F2L diagrams show the top, front, and right faces in a quarter view with mild perspective generated from Setup, with white down and green in front; pieces containing yellow are gray to emphasize F2L pieces. OLL/PLL retain their top-layer diagrams. All 41 cases include real Setup and algorithms from [SpeedCubeDB](https://speedcubedb.com/a/3x3/F2L) and [CubeRoot](https://cuberoot.me/alg/3x3/f2l/?orientation=z2). Source case numbers/names are documented in each definition. Wide moves use explicit `w` notation (for example, `Rw` and `Fw`). Algorithms containing `S`, `E`, `B`, `D`, `Dw`, or `y` (including inverse and double turns anywhere in the sequence) are excluded from the built-in F2L list. Duplicate notations and final y rotations are removed; Setup uses a low-cost outer-layer sequence that works with every listed solution. F2L, OLL, and PLL cases share a fixed ID independent of their display number (for example, `F2L-01`, `OLL-01`, and `PLL-Aa`). Custom algorithms and favorites use this ID, with the slot appended for F2L (`F2L-01-FR`), preserving existing keys when display numbers change.
- Case-specific drills with scrambles for a selected or random case
- F2L timing measures one pair: choose one of 41 cases or Random and a target slot (Random / FR / FL / BL / BR). Both case and slot default to Random; they can be randomized independently. Each new drill chooses an actual slot, which is retained in the saved result. Start white down and green in front, apply the common Setup and final cube rotation, then time solving the pair. Changing the slot keeps the current case. Only the timer remains visible while running. F2L, OLL, and PLL results retain a shared `caseId`, displayed number, and scramble in local storage and cloud sync; F2L also retains its slot. Retry uses the fixed case ID. Older records without an ID fall back to the case name, and the former F2L-only ID field is converted on read. History supports the F2L category for filtering, statistics, and Progress Chart; details show the case and slot, and Retry restores the original case, slot, and scramble.
  The type buttons support arrow-key navigation and stay synchronized with browser Back/Forward navigation. Each F2L / OLL / PLL page offers a native group dropdown independent of text search, using the browser/OS selection interface. Select a group (such as Connected Pairs) to match it exactly, combine it with text search, or select All groups to clear it. Switching types resets the group filter.

- Add, delete, copy, and favorite algorithms
- Create, rename, and delete record groups, moving their records to Unclassified on deletion, with one shared selection across timer and history
- Per-group statistics for best, overall average, Ao5, Ao12, Ao50, and Ao100
- `+2` and `DNF` penalties for solve records
- Retry any solve from history with its original scramble, category, and record group
- History rows with point-in-time Ao5/Ao12 and details for scrambles and cube previews
- English and Japanese interfaces
- Optional Google sign-in, confirmation-based guest record import, and cross-device solve synchronization
- Responsive layouts for desktop, tablet, and mobile devices, with a 16px base font and larger scramble and supporting text

## Related links

In **Settings → Related links**, open the browser-based Web version or visit the GitHub repository for source code and issue reports. Both links open in a new tab.

## Using the timer

Use the space bar with a keyboard or the on-screen timer on a touch device.

1. Hold the space bar or timer until it enters the ready state.
2. Release it to start timing.
3. Press again while the timer is running to stop and save the solve.

After stopping, you can apply a penalty, delete the latest solve, or retry the same scramble.

## Install and use offline

Open [CubeReps](https://nsase.github.io/cube-reps/) once while online. In a supported desktop or Android browser, use the browser menu or install button to install the app. On iPhone and iPad, open CubeReps in Safari, tap **Share**, and select **Add to Home Screen**.

After the first online load completes, the installed app can be started and reloaded offline. Solve records, groups, and algorithm preferences remain on the device. When running as an installed PWA, once a new version has finished downloading online, CubeReps displays a dismissible update notification with an **Update now** action so that you can switch versions safely.

Browser storage is separated by browser and installation context. In particular, Safari and a Home Screen web app on iOS/iPadOS may not share existing data, so records created in Safari might not appear in the installed app. Installing or updating CubeReps does not itself delete browser data.

## Android app (in development)

The Android app bundles the Angular UI, timer, and storage using Capacitor 8. It is distributed separately from the Web/PWA app and is not yet published on Google Play. iOS support is tracked in Issue #161.

- Install Node.js 22+, JDK 21, Android SDK 36 (Build Tools 36.0.0), and Android Studio 2025.2.1+.
- After `npm ci`, run `npm run android:debug` to create a development APK at `android/app/build/outputs/apk/debug/app-debug.apk`. For Android Studio, run `npm run android:sync` followed by `npm run android:open`.
- Builds without Firebase Android configuration support guest use only. They hide sign-in and offer timing, record storage, and algorithm practice.
- Screens, translations, and icons are bundled for offline use from the first launch. Google sign-in and cloud sync require a connection. Device verification results are tracked in Issue #160.
- The app keeps the screen awake during timing and prevents Android Back from leaving an active timer. Otherwise, Back dismisses a dismissible confirmation dialog, navigates through screen history, or minimizes the app when there is no history.
- The native app does not use PWA updates. Install a newer APK or a store update. Do not uninstall first when updating with the same application ID and signing key.

Browser/PWA storage and Android app storage are separate. Existing web guest records do not migrate automatically. To transfer account-owned solves, migrate the desired guest records to your account on the web, confirm that sync has completed, then sign into the same account on Android. Data that is not currently cloud-synced, such as algorithm preferences, does not migrate automatically. Guest-only APKs cannot retrieve cloud records.

See [Android development and distribution](docs/android.md) for authentication, signing, and device checks. CI builds a guest debug APK and uploads it as an artifact; this does not verify device startup, authentication, or data retention.

## Settings

Settings displays the version embedded in the app currently open, including when offline. It reads `package.json` at build time, so a downloaded update does not change the displayed number until the app reloads into that version.

Open **Settings** at the bottom of the sidebar (in the bottom navigation on mobile) to select English or Japanese. On the first visit, Japanese is selected for a Japanese browser language; otherwise English is used. The language applies throughout the app and is saved in this browser for the next visit; existing language preferences are preserved.

Select **Check for updates** to check for a new version. Settings displays checking, latest-version, update-available, and failure states. If an update is ready, select **Update now** to reload the app with the new version, even if you previously dismissed the update notification. A failed check or update can be retried. Update notifications and manual checking are only available when running as an installed PWA. Update checking is unavailable in regular browser tabs, development builds, and browsers without Service Worker support; Settings explains this instead of showing a latest-version result.

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
| `npm run start:pwa:local` | Serve an installable local PWA on port 4400  |
| `npm run build`           | Create a production build                    |
| `npm test`                | Run tests with Vitest                        |
| `npm run test:firestore`  | Test Firestore with the Emulator             |
| `npm run test:e2e:pr`     | Run desktop-wide browser tests for Issue PRs |
| `npm run test:e2e`        | Run all 7 Playwright projects                |
| `npm run prettier:format` | Format the project with Prettier             |

Local verification uses `npm test` (unit and component tests) and `git diff --check`. Builds, Firestore Emulator tests, and browser tests run in CI; do not run browser tests locally. PRs targeting `develop` run `npm run test:e2e:pr` (desktop-wide); release PRs targeting `main` require all 7 projects with `npm run test:e2e`. CI also runs build, unit tests, and Firestore Emulator tests for both. For UI, layout, or responsive changes needing additional viewport coverage, shared style changes, or unclear impact, run the CI workflow manually with `browser_scope: all` and record the scope and results in the PR. Manual CI also accepts `browser_scope: pr` for Issue PR coverage. All required CI checks must pass before merging.

Build output is written to `dist/cube-reps`.

The development server and local PWA builds use `CubeReps-local` for the page title and installed app name. To check offline PWA startup, run `npm run start:pwa:local`, open `http://localhost:4400` while online, and install the app from the browser. This command serves a production-mode build with Service Worker enabled; `npm start` does not enable Service Worker. The PWA build uses the configured Firebase cloud project, not the Firestore Emulator. Production builds retain the `CubeReps` name. The local PWA output is written to `dist/cube-reps-local`.

The server listens on `0.0.0.0:4400` so it can be reached through container port forwarding. Forward port 4400 when using a dev container.

The local HTML and Manifest are generated from `src/index.html` and `public/manifest.webmanifest`, changing only the page title and installation names. `npm start`, `npm run watch`, and `npm run start:pwa:local` regenerate them before starting. Edit the shared source files, then restart the command to apply changes. `.generated/local` is excluded from Git; do not edit generated files. When invoking Angular directly with the `local` configuration, run `npm run generate:local` first.

## Data storage

The following synchronization-ready user data is stored in your browser's `IndexedDB`:

- Solve records and penalties
- Record groups
- Custom and favorite OLL and PLL algorithms

The following device-specific settings are stored in `localStorage`:

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

Card appearance defaults to `outlined` through `MAT_CARD_CONFIG` in `src/app/app.config.ts`; individual cards only need an `appearance` attribute when overriding that default.

## Project structure

```text
src/app/
├── core/       # Cube logic, statistics, algorithms, and persistent data
│   ├── algorithm/     # Algorithm library and built-in OLL/PLL cases
│   ├── cube/          # Record store, Group/Solve services, cube state, and statistics
│   ├── local-storage/ # IndexedDB repository and local save queue
│   └── firestore/     # Cloud repositories and synchronization
├── features/   # Timer, algorithm library, history, and settings pages
└── shared/     # Shared UI such as cube views and confirmation dialogs
```

## License

CubeReps is available under the [0BSD (Zero-Clause BSD) License](LICENSE). You may use, copy, modify, and redistribute it for personal or commercial purposes.

## Preparing a release

`package.json` is the version source; `package-lock.json` must match both at its top level and in its root package. Ordinary issue PRs do not bump versions. Choose `patch` for compatible fixes, `minor` for compatible features, or `major` for breaking changes; choose the largest applicable change, including during 0.x development.

With a clean working tree, Git, npm, authenticated GitHub CLI (`gh auth login`), and push access to `origin`, run:

```bash
npm run release:prepare -- patch
```

Replace `patch` with `minor` or `major` as appropriate. The command fetches the latest `develop`, creates `version/<next-version>`, updates both package files without a Git tag or version lifecycle scripts, commits, pushes the branch, and creates a PR targeting `develop`. It does not merge or wait for CI. If it fails partway through, inspect `git status` and the existing branch/PR and resume manually; do not delete the branch or rerun to obtain another version.

After reviewing CI and merging the version PR into `develop`, create the release PR from `develop` to `main`. Use `.github/PULL_REQUEST_TEMPLATE/issue.md` for issue PRs, `version.md` for version PRs (filled by the command), and `release.md` for release PRs. Copy the template to a temporary body file, fill in its sections and actual verification results, then pass it explicitly:

```bash
gh pr create --base develop --head <issue-branch> --body-file /tmp/issue-pr.md
gh pr create --base main --head develop --title "Release <version>" --body-file /tmp/release-pr.md
```

Issue PRs use `Related to #<number>`; release PRs use `Closes #<number>` for each completed issue. Keep unverified checks unchecked. Release CI must pass Build, Unit Test, Firestore Emulator Test, and Browser Test across all seven projects; also run `git diff --check` locally. Keep `develop` after the release. Creating a version PR, merging it, and creating the release PR are separate steps.
