import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'muted';

const Tones: Record<BadgeTone, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-surface-sunken text-steel-700', dot: 'bg-steel-500' },
  ok: { chip: 'bg-ok-100 text-ok', dot: 'bg-ok' },
  warn: { chip: 'bg-hazard-100 text-warn', dot: 'bg-hazard-600' },
  danger: { chip: 'bg-danger-100 text-danger', dot: 'bg-danger' },
  info: { chip: 'bg-surface-sunken text-ink-600', dot: 'bg-ink-600' },
  muted: { chip: 'bg-surface-sunken text-steel-500', dot: 'bg-steel-300' },
};

@Component({
  selector: 'inv-badge',
  standalone: true,
  template: `
    @if (dot()) {
      <span class="h-1.5 w-1.5 rounded-full" [class]="dotClass()"></span>
    }
    <ng-content />
  `,
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  /** A leading dot reads as "state" rather than "label" — use it for statuses. */
  readonly dot = input(false, { transform: booleanAttribute });

  readonly classes = computed(
    () =>
      'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-2xs font-semibold uppercase ' +
      Tones[this.tone()].chip,
  );

  readonly dotClass = computed(() => Tones[this.tone()].dot);
}
