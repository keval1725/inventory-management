import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A hand-rolled sprite rather than an icon package: this app needs about thirty
 * glyphs, and they are all one geometric family — 24x24, 1.5px stroke, round
 * caps, no fills. A zero-length segment (`h.01`) renders as a dot under a round
 * cap, which is how the dot glyphs below are drawn.
 */
const Icons: Record<string, string[]> = {
  // Navigation
  grid: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  warehouse: ['M2 10 12 4l10 6v10H2V10Z', 'M7 20v-7h10v7'],
  box: ['M21 8 12 3 3 8v8l9 5 9-5V8Z', 'M3 8l9 5 9-5', 'M12 13v8'],
  layers: ['M12 3 3 8l9 5 9-5-9-5Z', 'M3 13l9 5 9-5'],

  // Controls
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm16.5 16.5 4 4'],
  plus: ['M12 5v14', 'M5 12h14'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  check: ['m5 13 4 4L19 7'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  'more-horizontal': ['M6 12h.01M12 12h.01M18 12h.01'],
  filter: ['M3 5h18l-7 8v6l-4-2v-4L3 5Z'],
  sliders: ['M4 8h16', 'M4 16h16', 'M15 6v4', 'M9 14v4'],
  tag: ['m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8Z', 'M7.5 7.5h.01'],

  // Direction
  'chevron-up': ['m6 15 6-6 6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m14 6-6 6 6 6'],
  'chevron-right': ['m10 6 6 6-6 6'],
  'chevrons-left': ['m11 6-6 6 6 6', 'm18 6-6 6 6 6'],
  'chevrons-right': ['m13 6 6 6-6 6', 'm6 6 6 6-6 6'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up-down': ['m7 10 5-5 5 5', 'm7 14 5 5 5-5'],
  'trending-down': ['m22 17-8.5-8.5-4 4L2 5', 'M16 17h6v-6'],

  // Record actions
  pencil: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z'],
  power: ['M12 4v8', 'M18.4 6.6a9 9 0 1 1-12.8 0'],
  'rotate-ccw': ['M3 12a9 9 0 1 0 2.6-6.4', 'M3 3v6h6'],
  refresh: ['M21 12a9 9 0 1 1-2.6-6.4', 'M21 3v6h-6'],

  // Status
  'check-circle': ['M22 11.1V12a10 10 0 1 1-5.9-9.1', 'm9 11 3 3L22 4'],
  'alert-triangle': ['m12 3 9.5 16.5H2.5L12 3Z', 'M12 9v4', 'M12 17h.01'],
  'alert-circle': ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5', 'M12 16h.01'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v5', 'M12 8h.01'],

  // Shell & states
  'panel-left': ['M4 4h16v16H4z', 'M10 4v16'],
  'log-out': ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'm10 16 4-4-4-4', 'M14 12H3'],
  user: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.5 5.5h13l3.5 6.5v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-6.5Z'],
};

export type IconName = keyof typeof Icons;

@Component({
  selector: 'inv-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      class="block"
    >
      @for (path of paths(); track path) {
        <path [attr.d]="path" />
      }
    </svg>
  `,
  host: { class: 'inline-flex shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(16);

  /** Thinner strokes read better as glyphs grow; heavier ones hold up when small. */
  readonly strokeWidth = computed(() => (this.size() >= 32 ? 1.25 : 1.5));

  readonly paths = computed(() => Icons[this.name()] ?? []);
}
