# CubeReps

<p align="center">
  <img src="public/cube-reps-mark.svg" alt="CubeReps logo" width="96" height="96">
</p>

[English](README.md) | **日本語**

CubeRepsは、スピードキューブの計測とトレーニングをブラウザ上で完結できるWebアプリです。計測記録や設定はブラウザ内に保存されるため、アカウント登録やサーバー接続は必要ありません。

[CubeRepsを開く](https://nsase.github.io/cube-reps/)

## 主な機能

- フルソルブ、OLL、PLLのタイム計測
- ランダムステートスクランブルとキューブ展開図の表示
- OLL 57ケース、PLL 21ケースの一覧・検索
- ケース別ドリルと選択またはランダムなケースに対応したスクランブル生成
- 手順の追加、削除、コピー、お気に入り設定
- 記録グループの作成・名称変更・削除、削除時の記録の未分類への移動、タイマー・履歴間での選択共有
- 選択したグループごとのベスト、全体平均、Ao5、Ao12、Ao50、Ao100の集計
- 計測記録への`+2`・`DNF`ペナルティ設定
- 履歴の任意記録を元のスクランブル・カテゴリー・記録グループで再計測
- 履歴一覧への各時点のAo5・Ao12表示と、スクランブル・展開図の詳細表示
- 日本語・英語の表示切り替え
- Googleアカウントによる任意のログインと、確認付きのローカル計測記録の初回アップロード
- PC、タブレット、スマートフォン対応

## タイマーの使い方

キーボードではスペースキー、タッチ端末では画面上のタイマーを使用します。

1. スペースキーまたはタイマーを押し続けて準備状態にします。
2. 離すと計測を開始します。
3. 計測中にもう一度押すと停止し、記録を保存します。

停止後は、直前の記録へのペナルティ設定、削除、同じスクランブルでの再計測ができます。

## インストールとオフライン利用

オンライン状態で[CubeReps](https://nsase.github.io/cube-reps/)を一度開きます。対応するPC・Androidブラウザでは、ブラウザのメニューまたはインストールボタンからアプリをインストールできます。iPhone・iPadではSafariでCubeRepsを開き、**共有**から**ホーム画面に追加**を選択します。

最初のオンライン読み込みが完了すると、インストールしたアプリをオフラインで起動・再読み込みできます。計測記録、グループ、手順設定は端末内に保持されます。オンライン時に新版の取得が完了すると、CubeRepsに閉じることのできる更新通知と**今すぐ更新**が表示され、ユーザー操作で安全に切り替えられます。

ブラウザの保存領域は、ブラウザとインストール方法によって分かれます。特にiOS・iPadOSではSafariとホーム画面Webアプリが既存データを共有しない場合があり、Safariで作成した記録がインストール後のアプリに表示されないことがあります。CubeRepsのインストールや更新自体がブラウザデータを削除することはありません。

## Googleアカウントでのログイン

画面上部の**Googleでログイン**からログインできます。ログインは任意です。アカウントがなくてもTimer、履歴、端末内に保存した手順を利用でき、一度アプリを読み込んだ後はオフラインでも引き続き利用できます。

ログインすると、CubeRepsは端末内のSolve IDとログイン中アカウントのFirestore記録を比較し、アップロードが必要な件数と保存先アカウントを表示します。**アップロード**を選択するまでデータは送信されません。Solve UUIDを使うため再実行しても重複せず、中断時は失敗した記録だけを再試行できます。移行後もローカル記録は削除されません。

同じUUIDで内容が異なる場合は、`updatedAt`が新しい方を優先し、同時刻ならスキーマバージョンが高い方、それでも同じならクラウド側を保持します。以後の変更はまだ継続同期されません。ログアウトしても端末内のデータは残ります。ログインとログアウトの操作自体にはインターネット接続が必要です。

## セットアップ

Node.jsとnpmを用意し、リポジトリ内で次のコマンドを実行します。

```bash
npm install
npx playwright install chromium
npm start
```

開発サーバーは通常、[http://localhost:4200](http://localhost:4200)で起動します。

`src/app/core/auth/firebase.config.ts`のFirebase Web設定には、ブラウザからCubeRepsのFirebaseプロジェクトへ接続するための公開識別情報が含まれます。サービスアカウントJSON、秘密鍵、アクセストークンなどの管理者認証情報はフロントエンドやリポジトリへ追加しないでください。ブラウザアプリでは必要ありません。

Firestoreの開発にはJava 21以降が必要です。`npm run test:firestore`は`demo-cube-reps`というローカル専用プロジェクトIDでFirestore Emulatorを起動し、CRUDとSecurity Rulesを検証します。本番データへは接続しません。ルールとインデックスは`firestore.rules`、`firestore.indexes.json`、`firebase.json`で管理しています。本番へ反映するときは、Firebase CLIで対象プロジェクトを確認してから`firebase deploy --only firestore:rules,firestore:indexes`を実行します。

## 開発コマンド

| コマンド                  | 内容                             |
| ------------------------- | -------------------------------- |
| `npm start`               | 開発サーバーを起動               |
| `npm run build`           | プロダクションビルドを作成       |
| `npm test`                | Vitestでテストを実行             |
| `npm run test:firestore`  | EmulatorでFirestoreをテスト      |
| `npm run test:e2e`        | Playwrightでブラウザテストを実行 |
| `npm run prettier:format` | プロジェクト全体をPrettierで整形 |

ビルド成果物は`dist/cube-reps`へ出力されます。

## データの保存

同期へ対応できる次のユーザーデータは、ブラウザの`IndexedDB`へ保存されます。

- 計測記録とペナルティ
- 記録グループ
- OLL・PLLの追加手順とお気に入り

以前`localStorage`へ保存された既存データは、アプリ起動時に自動移行されます。次の端末固有設定は引き続き`localStorage`へ保存されます。

- 現在の記録先
- 表示言語

データは利用中のブラウザとオリジンに紐づきます。ブラウザのサイトデータを削除すると、CubeRepsの記録も削除されます。現在、継続的なクラウド同期やエクスポート機能はありません。

初回移行では、明示的な確認後にだけログインユーザー本人の`users/{userId}/solves/{solveId}`へ書き込みます。固定UUIDをドキュメントIDに使うため、再実行や再試行でも記録は重複しません。継続同期が実装されるまでは、Timerと履歴は引き続き端末内のローカル記録を使用します。

## 技術構成

- Angular 21
- Angular Material
- Angular Signals / Signal Store
- Transloco
- Firebase Authentication
- Cloud Firestore / Firebase Emulator Suite
- Vitest
- Playwright
- SCSS

各画面はStandalone Componentとして構成し、ルート単位で遅延読み込みしています。アプリ全体の永続データはrootサービス、タイマーや履歴画面の一時状態は画面スコープのSignal Storeで管理しています。

Angular Materialの共通テーマとアプリ用のカラー変数は、`src/styles/_material-theme.scss`で定義しています。Materialコンポーネントの配色は、個別コンポーネントのスタイルで上書きせず、このテーマで調整します。

## ディレクトリ構成

```text
src/app/
├── core/       # キューブ、集計、手順、永続データ
├── features/   # タイマー、手順一覧、履歴の各画面
└── shared/     # キューブ表示や確認ダイアログなどの共通UI
```

## ライセンス

[0BSD（Zero-Clause BSD）](LICENSE)で公開しています。個人・商用を問わず、利用、複製、変更、再配布が可能です。
