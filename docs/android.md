# Android development and distribution

**English** | [日本語](android.ja.md)

## Scope and current stage

Android work is tracked in #160. The application ID is `io.github.nsase.cubereps` and the display name is `CubeReps`. Confirm the ID before publishing. The iOS project, Apple authentication, and App Store distribution belong to #161.

This change implements the Android foundation and authentication bridge. Device verification, Firebase registration, signing keys, Google Play testing, and public distribution still require setup. The CI APK is for guest testing, not direct store submission.

## Development

Requirements: Node.js 22+, npm 11.6.2, JDK 21, Android SDK Platform 36 and Build Tools 36.0.0. Use Android Studio 2025.2.1+ if you want an IDE. Set the SDK location through `ANDROID_HOME` or `sdk.dir` in `android/local.properties`. The current devcontainer does not automatically configure the Android SDK or device access.

```sh
npm ci
npm run android:sync
npm run android:open
```

To build and install from the command line:

```sh
npm run android:debug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

On Windows, after `npm run android:sync`, run `gradlew.bat assembleDebug` inside `android` when invoking Gradle directly.

`android:sync` builds the `production,native` configuration into `dist/cube-reps-native/browser` and copies it into the native project, separately from the Web/PWA output in `dist/cube-reps`. It does not load the hosted website or update code using a Service Worker. Sync and rebuild the APK after UI changes.

The native plugin list and Gradle integration files are regenerated during sync. Change dependencies and `capacitor.config.ts` instead of editing generated files.

## Google sign-in and Firebase

1. Register an Android app with package name `io.github.nsase.cubereps` in the existing `cube-reps` Firebase project.
2. Enable Google sign-in in Firebase Authentication.
3. Register the SHA-1/SHA-256 fingerprints for each signing certificate. For debug builds, run `./gradlew signingReport` inside `android`. For Play builds, register the Play App Signing certificate, which differs from the upload key.
4. Save the updated configuration as `android/app/google-services.json`. It must include the web client ID for Google sign-in. This file is excluded from Git.
5. Run `npm run android:sync` again and build the APK.

Without this configuration, the build excludes the native Firebase plugin to avoid initializing an unconfigured SDK, and supports guest use only. When the file exists, Google Services validates it; invalid configuration fails the build.

The native Google ID token is passed to Firebase JavaScript SDK `signInWithCredential`. Authentication state and Firestore sync use the same SDK and UID as the web app; native Firebase authentication is skipped. Verify real Google sign-in, cancellation, sign-out, and session restoration using a configured APK on a device.

## Versions and signing

Android `versionName` is read from the root `package.json`. Ordinary issue work does not change this version. Set `ANDROID_VERSION_CODE` to a positive integer larger than previous distributed builds. Debug builds default to 1 when it is unset.

Release builds require these environment variables. Never commit signing keys or passwords.

| Variable                    | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `ANDROID_VERSION_CODE`      | Increasing distribution number, up to 2100000000 |
| `ANDROID_KEYSTORE_PATH`     | Absolute path to the upload keystore             |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password                                |
| `ANDROID_KEY_ALIAS`         | Key alias                                        |
| `ANDROID_KEY_PASSWORD`      | Key password                                     |

```sh
npm run android:bundle
```

The AAB is written to `android/app/build/outputs/bundle/release/app-release.aab`. Missing Firebase configuration, signing configuration, or version code fails the release build. Back up signing keys separately and securely. Do not assume that debug-signed APKs can update a Play-signed app or preserve its data through a replacement installation.

## Verification and distribution

- Run `npm test` and `git diff --check` locally.
- In addition to existing web checks, CI builds an Android guest debug APK and uploads the `cube-reps-android-guest-debug` artifact.
- Playwright runs only in CI. Browser tests of Android UI branches do not replace native plugin or device verification.
- Build an APK with Firebase configuration to test Google sign-in. Current CI does not use that configuration or release signing.

Verify these items on devices and record results in #160:

- [ ] First offline launch, scramble generation, OLL/PLL display, language switching
- [ ] Hold-to-start/touch-to-stop, screen wake lock, Back suppression during timing
- [ ] Record saving, restart, and data retention after an update signed with the same key
- [ ] Back through dialogs/history/minimization, external links, rotation, system bar overlap
- [ ] Background/resume behavior, elapsed time, and saved-record consistency
- [ ] Google sign-in, cancellation, sign-out, session restoration, guest migration, cross-device sync, offline retries

Before public Google Play distribution, complete developer registration, testing, privacy policy, Data safety and account deletion requirements, listing images and descriptions, and check current Play Console requirements. Account deletion is not implemented by this change. Check any closed-testing requirements for new personal developer accounts against the actual publishing account.

## References

- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor Firebase Authentication](https://capawesome.io/docs/sdks/capacitor/firebase/authentication/)
- [Google Play testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
