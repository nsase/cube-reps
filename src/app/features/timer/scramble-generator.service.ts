import { Injectable } from '@angular/core';

/** Timerの画面スコープで次の計測用スクランブルを生成する。 */
@Injectable()
export class ScrambleGenerator {
  /** 初期化中のPromiseも共有し、同時に生成を要求されてもWorker設定を一度だけ行う。 */
  private scrambleLibrary?: Promise<typeof import('cubing/scramble')>;

  /**
   * 3×3の合法状態を均等に選んだスクランブルを端末内で生成する。
   * @returns random-state scramble
   */
  async createScramble(): Promise<string> {
    const { randomScrambleForEvent } = await (this.scrambleLibrary ??=
      this.initializeScrambleLibrary().catch((error: unknown) => {
        this.scrambleLibrary = undefined;
        throw error;
      }));
    return (await randomScrambleForEvent('333')).toString();
  }

  /**
   * 初回の生成要求でライブラリを読み込み、Worker起動前に共通設定を適用する。
   * esbuild向けの起動を優先し、ビルド後に存在しないURLへの不要な通信を避ける。
   * @returns 設定を適用済みのスクランブル生成ライブラリ
   */
  private async initializeScrambleLibrary(): Promise<typeof import('cubing/scramble')> {
    const [scramble, { setSearchDebug }] = await Promise.all([
      import('cubing/scramble'),
      import('cubing/search'),
    ]);
    setSearchDebug({
      logPerf: false,
      prioritizeEsbuildWorkaroundForWorkerInstantiation: true,
    });
    return scramble;
  }
}
