/// <reference types="@capacitor-firebase/authentication" />
import { existsSync } from 'node:fs';
import type { CapacitorConfig } from '@capacitor/cli';

/** Web版と同じ画面を同梱し、ストアから更新するネイティブアプリの設定。 */
const config: CapacitorConfig = {
  appId: 'io.github.nsase.cubereps',
  appName: 'CubeReps',
  webDir: 'dist/cube-reps-native/browser',
  android: { backgroundColor: '#181a17' },
  // Firebase未設定の開発用APKはゲスト利用に限定し、未初期化のネイティブSDKを起動しない。
  includePlugins: [
    '@capacitor/app',
    '@capacitor-community/keep-awake',
    ...(existsSync('android/app/google-services.json')
      ? ['@capacitor-firebase/authentication']
      : []),
  ],
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
