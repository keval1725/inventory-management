import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Label + control + one message slot.
 *
 * Optional fields are marked, rather than required ones: in this app most fields
 * are required, so asterisks everywhere would carry no information.
 *
 * The control is projected, so wiring accessibility is the caller's job — give
 * the control `[id]="fieldId"` and `[attr.aria-describedby]="messageId"`, and set
 * `aria-invalid` when `error` is set. `messageId` is derived from `for` here.
 */
@Component({
  selector: 'inv-field',
  standalone: true,
  imports: [IconComponent],
  template: `
    <label [attr.for]="for()" class="mb-1 flex items-baseline gap-1.5">
      <span class="text-xs font-medium text-ink">{{ label() }}</span>
      @if (optional()) {
        <span class="text-2xs font-normal normal-case text-steel-400">optional</span>
      }
    </label>

    <ng-content />

    @if (error()) {
      <p [id]="messageId()" class="mt-1 flex items-start gap-1 text-xs text-danger">
        <inv-icon name="alert-circle" [size]="12" class="mt-0.5" />
        <span>{{ error() }}</span>
      </p>
    } @else if (hint()) {
      <p [id]="messageId()" class="mt-1 text-xs text-steel-500">{{ hint() }}</p>
    }
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
  readonly label = input.required<string>();
  /** Id of the control this labels. */
  readonly for = input.required<string>();
  readonly hint = input<string>();
  /** Set to the resolved validation message; replaces the hint while present. */
  readonly error = input<string>();
  readonly optional = input(false, { transform: booleanAttribute });

  readonly messageId = computed(() => `${this.for()}-message`);
}
