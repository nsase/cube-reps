# Development Rules

## Angular

- AngularのコンポーネントはStandalone Componentとして作成する。
- UI上のまとまりは、責務が分かる単位で積極的に子コンポーネントへ分割する。
- 一覧は親コンポーネントでループし、1件分の表示と操作は子コンポーネントへ分離する。
- 親コンポーネントには、画面全体の構成、画面外へのイベント通知、画面スコープのProviderを残す。
- 同一画面の子コンポーネント間で共有する状態は、`providedIn: 'root'`を指定しないSignal Storeで管理する。
- Signal Storeは画面ルートコンポーネントの`providers`で提供し、そのコンポーネントツリー内だけで共有する。
- アプリ全体の永続データやドメイン操作はrootサービス、画面固有の一時状態は画面スコープのSignal Storeへ配置する。
- Writable Signalへ値をそのまま設定する`ngModel`は、`[(ngModel)]`で双方向バインドする。
- 値の変換、検証、副作用が必要な場合だけ、`[ngModel]`と`(ngModelChange)`を分けて記述する。

## Angular Material

- Angular Materialのディレクティブを使用するコンポーネントでは、対応するModuleを明示的に`imports`へ追加する。
- `mat-icon-button`を使用する場合は、`MatButtonModule`と`MatIconModule`をimportする。
- ボタンには可能な限り`mat-button`、`mat-flat-button`、`mat-icon-button`を使用する。
- Material Buttonのborder、border-radius、背景色などの基本デザインをコンポーネント固有のCSSで上書きしない。
- Material Buttonの共通色は、グローバルスタイルのMaterial CSS変数で設定する。
- `mat-icon`へレイアウト調整目的の`width`や`padding`を直接設定しない。
- `mat-icon-button`の`line-height`はグローバルスタイルで統一する。
- アイコンボタンへRipple形状と合わない四角いborderや背景色を追加しない。

## Components and State

- 子コンポーネント自身で完結する表示状態や入力値は、その子コンポーネントのSignalとして管理する。
- 複数の子コンポーネントが参照・更新する画面状態は、画面スコープのSignal Storeへ配置する。
- コンポーネントツリーの外へ通知する操作には`output`を使用する。
- 単なる中継になる`input`と`output`を増やさず、同じ画面スコープではSignal Storeの利用を検討する。
- コンポーネント固有の処理とSCSSは、そのコンポーネントのディレクトリへ配置する。

## Documentation

- TypeScriptコードを追加または変更するときは、日本語のJSDocを追加・更新する。
- クラス、サービス、Signal、computed、input、output、公開・protectedメソッドの目的をJSDocで説明する。
- 引数があるメソッドには必要に応じて`@param`、戻り値に説明が必要な場合は`@returns`を記載する。
- コメントは実装内容の言い換えではなく、責務や意図が分かる内容にする。

## Styles

- 子コンポーネント固有のSCSSは親に残さず、その子コンポーネントへ移動する。
- グローバルに統一すべきMaterialテーマやボタン設定は、コンポーネントSCSSではなくグローバルスタイルへ配置する。
- レスポンシブスタイルも、対象要素を所有するコンポーネントへ配置する。
- 既存のCSS変数を優先して使用し、同じ意味の色やサイズを重複定義しない。

## Confirmation Dialogs

- 確認操作には共通のAngular Material `MatDialog`コンポーネントを使用する。
- ダイアログのボタンは配列で渡し、押されたボタンのIDを結果として扱う。
- `OK`や`Yes`だけでなく、`削除`など操作内容が直感的に分かるボタンラベルを使用する。
- 破壊的操作では安全なボタンへデフォルトフォーカスを設定する。

## Component Tests

- 画面または画面コンポーネントを新しく作成するときは、対応するコンポーネントテストも追加する。
- 画面の表示、操作、状態管理を変更するときは、既存の画面テストを更新するか、変更内容を保証するテストを追加する。
- 一覧の追加・削除・選択、フォーム入力、絞り込み、集計、画面状態の連動など、ユーザーから見える振る舞いをテストする。
- Signal Storeを使用する画面では、Storeの状態遷移と、その状態を使用するコンポーネントの表示・操作をそれぞれ必要に応じてテストする。
- Angular Material Dialogを伴う操作では、確認結果をテスト用に制御し、確定時と必要に応じてキャンセル時の振る舞いを確認する。
- コンポーネントの内部実装へ過度に依存せず、DOM操作、Signalの結果、サービスの状態からユーザー操作の結果を確認する。

## Verification

- コード変更後は`npm run build`を実行する。
- コード変更後は`npm test`を実行する。
- 最後に`git diff --check`を実行し、空白エラーがないことを確認する。
- ビルド警告が既存のものか、新しい変更によるものかを区別して報告する。
