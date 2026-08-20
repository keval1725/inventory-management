import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'inv-spinner',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      class="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" class="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  `,
  host: { class: 'inline-flex shrink-0', role: 'status', 'aria-label': 'Loading' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly size = input(16);
}
