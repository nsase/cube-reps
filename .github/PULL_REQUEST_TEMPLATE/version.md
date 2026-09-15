## Summary

- Prepare release {{VERSION}} ({{BUMP}}).
- Update package.json and package-lock.json; Settings reads the version from package.json at build time.

## Verification

- [x] package.json and package-lock.json updated together using npm version
- [ ] CI: `npm run build`
- [ ] ローカル: `npm test`（Unit Test・Component Test）／CI: Unit Test
- [ ] CI: `npm run test:firestore`
- [ ] CIのみのBrowser Test: `npm run test:e2e:pr`（desktop-wide）
- 手動CIによる追加のviewport確認（必要時は`browser_scope: all`の範囲と結果を記載）:
- [x] ローカル: `git diff --check`

## Documentation

- [ ] `README.md`と`README.ja.md`を更新した、または変更が不要であることを確認した

## Related Issue

<!-- 必要な場合はRelated to #番号を追記する。ここではIssueを閉じない。 -->
