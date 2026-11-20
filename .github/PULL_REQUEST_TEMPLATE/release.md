## Summary

-

## Release version

- Version:
- [ ] バージョン更新PRがdevelopへmerge済み
- [ ] package.jsonとpackage-lock.jsonのバージョンが一致している
- [ ] 表示用バージョンがpackage.jsonを参照している
- [ ] 更新種別が変更内容に適切である
- [ ] 完了する各IssueをCloses #で記載した

## Verification

- [ ] CI: `npm run build`
- [ ] ローカル: `npm test`（Unit Test・Component Test）／CI: Unit Test
- [ ] CI: `npm run test:firestore`
- [ ] CIのみのBrowser Test: `npm run test:e2e`（全7プロジェクト）
- 手動CIによる追加のviewport確認（必要時は`browser_scope: all`の範囲と結果を記載）:
- [ ] ローカル: `git diff --check`

## Firebase manual tasks

- [ ] Firestore/Firebaseの本番設定に手動作業が必要か確認した
- 必要な作業（不要なら「なし」。必要な場合は対象プロジェクト・設定箇所/コマンド・変更内容・実施タイミング・確認方法を未完了のチェック項目として記載）:

## Documentation

- [ ] `README.md`と`README.ja.md`を更新した、または変更が不要であることを確認した

## Related Issue

Closes #
