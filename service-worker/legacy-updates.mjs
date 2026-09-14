/** 旧Angular画面の更新操作を完了させ、既に配信可能なWorkbox版へ再読み込みで移行させる。 */
export function handleLegacyUpdate(event, revision) {
  const { action, nonce } = event.data ?? {};
  if (!event.source || (action !== 'CHECK_FOR_UPDATES' && action !== 'ACTIVATE_UPDATE')) return;
  // このメッセージは旧画面のcontrollerに届くため、受信したWorkboxは既に有効である。
  if (action === 'CHECK_FOR_UPDATES') {
    event.source.postMessage({
      type: 'VERSION_READY',
      currentVersion: { hash: 'legacy-angular-client' },
      latestVersion: { hash: revision },
    });
  }
  event.source.postMessage({ type: 'OPERATION_COMPLETED', nonce, result: true });
}
