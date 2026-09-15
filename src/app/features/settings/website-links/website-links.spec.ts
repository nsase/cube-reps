import { TestBed } from '@angular/core/testing';
import { WebsiteLinks } from './website-links';

describe('WebsiteLinks', () => {
  it('Web版とGitHubへのリンクを別タブで安全に開く', async () => {
    TestBed.configureTestingModule({ imports: [WebsiteLinks] });
    const fixture = TestBed.createComponent(WebsiteLinks);
    await fixture.whenStable();
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map((link) => link.href)).toEqual([
      'https://nsase.github.io/cube-reps/',
      'https://github.com/nsase/cube-reps',
    ]);
    for (const link of links) {
      expect(link.target).toBe('_blank');
      expect(link.relList.contains('noopener')).toBe(true);
      expect(link.relList.contains('noreferrer')).toBe(true);
      expect(link.textContent?.trim()).not.toBe('');
    }
  });
});
