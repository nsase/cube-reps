# Android開発・配布

[English](android.md) | **日本語**

## 対象と現在の段階

Issue #160でAndroid対応を進めます。アプリIDは`io.github.nsase.cubereps`、表示名は`CubeReps`です。公開前にアプリIDを確定してください。iOSプロジェクト・Apple向け認証・App Store公開は#161で扱います。

この変更はAndroid基盤と認証接続の実装です。実機での検証、Firebase登録、署名鍵の用意、Google Playでのテスト配布・一般公開は別途必要です。CIのAPKはゲスト動作確認用で、そのままストア公開する成果物ではありません。

## 開発

前提: Node.js 22以上、npm 11.6.2、JDK 21、Android SDK Platform 36・Build Tools 36.0.0。IDEを使う場合はAndroid Studio 2025.2.1以上を使用します。SDKの場所は`ANDROID_HOME`または`android/local.properties`の`sdk.dir`で指定します。現在のdevcontainerはAndroid SDK・実機接続を自動設定しません。

```sh
npm ci
npm run android:sync
npm run android:open
```

コマンドだけでAPKを作る場合:

```sh
npm run android:debug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Windowsの端末から直接Gradleを使う場合は、`npm run android:sync`の後、`android`内で`gradlew.bat assembleDebug`を実行します。

`android:sync`は`production,native`構成で`dist/cube-reps-native/browser`へビルドし、端末プロジェクトへコピーします。Web/PWAの`dist/cube-reps`とは別です。URLからWeb版を読み込む設定や、Service Workerによるコード更新は行いません。UIを変更したら再度syncしてAPKをビルドします。

ネイティブのプラグイン一覧とGradle連携ファイルはsync時に生成します。直接編集せず、依存パッケージと`capacitor.config.ts`を変更してください。

## GoogleログインとFirebase

1. 既存のFirebaseプロジェクト`cube-reps`へ、パッケージ名`io.github.nsase.cubereps`のAndroidアプリを登録します。
2. Firebase AuthenticationでGoogleログインを有効にします。
3. 利用する署名証明書のSHA-1/SHA-256を登録します。debug用は`cd android`後に`./gradlew signingReport`で確認できます。Play配布版はPlay App Signingのアプリ署名証明書を登録します。アップロード鍵と取り違えないでください。
4. 更新した`google-services.json`を`android/app/google-services.json`へ保存します。Googleログイン用のWebクライアントIDが含まれる設定を使用します。このファイルはGit管理対象外です。
5. `npm run android:sync`を再実行してからAPKをビルドします。

設定ファイルがないときは、初期化できないネイティブFirebaseプラグインを同梱せず、ゲスト利用専用APKを作ります。設定ファイルがある場合はGoogle Servicesプラグインで検証するため、不正な設定はビルドエラーになります。

AndroidのGoogle認証で取得したIDトークンをFirebase JavaScript SDKの`signInWithCredential`へ渡します。認証状態とFirestore同期はWeb版と同じSDK・UIDを利用し、ネイティブ側に別のFirebaseログイン状態を作らない設定です。実際のGoogleログイン、キャンセル、ログアウト、再起動後の復元は、設定済みAPKと実機で確認してください。

## バージョンと署名

Androidの`versionName`はルートの`package.json`から読み込みます。通常のIssue実装ではその番号を変更しません。Playの`versionCode`は、既存の配布物より大きい正整数を`ANDROID_VERSION_CODE`で指定します。未指定時のdebug用番号は1です。

releaseには次の環境変数が必要です。署名鍵やパスワードをGitへ保存しないでください。

| 変数                        | 内容                                   |
| --------------------------- | -------------------------------------- |
| `ANDROID_VERSION_CODE`      | 配布ごとに増やす番号（最大2100000000） |
| `ANDROID_KEYSTORE_PATH`     | アップロード用keystoreの絶対パス       |
| `ANDROID_KEYSTORE_PASSWORD` | keystoreのパスワード                   |
| `ANDROID_KEY_ALIAS`         | 鍵の別名                               |
| `ANDROID_KEY_PASSWORD`      | 鍵のパスワード                         |

```sh
npm run android:bundle
```

AABは`android/app/build/outputs/bundle/release/app-release.aab`へ出力します。Firebase設定・署名・配布番号が不足していればreleaseを失敗させます。署名鍵は別途安全に保管してください。debug署名のAPKとPlay署名のアプリでは上書き更新やデータ引継ぎを前提にできません。

## 検証と配布

- ローカルでは`npm test`と`git diff --check`を実行します。
- CIでは既存のWeb検証に加え、Androidのゲストdebug APKをビルドします。`cube-reps-android-guest-debug` Artifactから取得できます。
- PlaywrightはCIのみで実行します。ブラウザ上のAndroid表示分岐テストは、実際のAndroidプラグインや端末の検証を代替しません。
- Googleログインを含むAPKはFirebase設定を用意してビルドします。現時点のCIはその設定やrelease署名を使用しません。

実機で確認し、結果を#160に記録する項目:

- [ ] 初回オフライン起動、スクランブル生成、OLL/PLL表示、日英切替
- [ ] 長押し開始・タッチ停止、計測中の消灯防止と戻る操作の抑止
- [ ] 停止後の記録保存、アプリ再起動、同一署名での上書き更新後の記録保持
- [ ] ダイアログ・画面履歴・最小化の戻る操作、外部リンク、画面回転、システムバーとの重なり
- [ ] バックグラウンドからの復帰、計測表示、保存の整合性
- [ ] Googleログイン、キャンセル、ログアウト、認証復元、ゲスト取り込み、端末間同期、オフライン再送

Google Playの一般公開前に、開発者登録、テスト配布、プライバシーポリシー・Data safety・アカウント削除要件、掲載画像・説明を準備し、最新のPlay Console要件を確認します。アカウント削除機能はこの変更に含まれません。新しい個人アカウントに適用されるクローズドテスト要件などは、実際のアカウントで確認してください。

## 参考

- [Capacitor環境構築](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor Firebase Authentication](https://capawesome.io/docs/sdks/capacitor/firebase/authentication/)
- [Google Playのテスト要件](https://support.google.com/googleplay/android-developer/answer/14151465)
