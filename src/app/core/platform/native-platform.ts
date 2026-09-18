import { InjectionToken } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/** ブラウザ/PWAと、端末へインストールしたネイティブアプリを区別する。 */
export const IS_NATIVE_APP = new InjectionToken<boolean>('IS_NATIVE_APP', {
  providedIn: 'root',
  factory: () => Capacitor.isNativePlatform(),
});

/** Firebaseを設定していない開発用APKで、利用できないログイン操作を案内しない。 */
export const GOOGLE_SIGN_IN_AVAILABLE = new InjectionToken<boolean>('GOOGLE_SIGN_IN_AVAILABLE', {
  providedIn: 'root',
  factory: () =>
    !Capacitor.isNativePlatform() || Capacitor.isPluginAvailable('FirebaseAuthentication'),
});
