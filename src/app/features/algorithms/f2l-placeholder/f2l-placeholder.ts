import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AlgorithmKindLinks } from '../algorithm-kind-links/algorithm-kind-links';

/** F2Lの実装前にもアクセス先と準備状況を案内する仮画面。 */
@Component({
  selector: 'app-f2l-placeholder',
  imports: [AlgorithmKindLinks, TranslocoPipe],
  template: `<section>
    <app-algorithm-kind-links />
    <h2>F2L</h2>
    <p>{{ 'algorithms.f2lPlaceholder' | transloco }}</p>
  </section>`,
  styles: `
    section {
      max-width: 1120px;
      margin: 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class F2lPlaceholder {}
