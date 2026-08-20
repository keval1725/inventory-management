import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A placeholder that occupies the same space as the content it stands in for.
 * Size it from the call site (`<inv-skeleton class="h-4 w-32" />`) so a loading
 * table keeps the row height and column rhythm of a loaded one — the page
 * shouldn't reflow when data lands.
 */
@Component({
  selector: 'inv-skeleton',
  standalone: true,
  template: '',
  host: {
    class:
      'block animate-shimmer rounded-sm bg-[length:200%_100%] ' +
      'bg-[linear-gradient(90deg,theme(colors.surface.sunken)_0%,#EAEBE8_50%,theme(colors.surface.sunken)_100%)]',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {}
