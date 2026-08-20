import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

@Component({
  selector: 'inv-search-input',
  standalone: true,
  imports: [IconComponent, ButtonDirective],
  template: `
    <div class="relative">
      <inv-icon
        name="search"
        [size]="14"
        class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-steel-400"
      />

      <input
        type="text"
        [value]="term()"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($event)"
        class="h-8 pl-8 pr-8"
      />

      @if (term()) {
        <button
          type="button"
          invButton
          variant="ghost"
          size="sm"
          iconOnly
          class="absolute right-0.5 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
          (click)="onClear()"
        >
          <inv-icon name="x" [size]="14" />
        </button>
      }
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  readonly value = input('');
  readonly placeholder = input('Search');
  readonly debounceMs = input(300);

  /** Named `searchChange` rather than `search`, which is a native DOM event on this input. */
  readonly searchChange = output<string>();

  /**
   * Writable, but re-seeded whenever `value` changes — so restoring a search
   * term from the URL updates the box, while typing stays local until it settles.
   */
  readonly term = linkedSignal(() => this.value());

  private readonly typed$ = new Subject<string>();

  constructor() {
    this.typed$
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.searchChange.emit(term));
  }

  onInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.term.set(term);
    this.typed$.next(term);
  }

  /** Clearing is an explicit act, so it takes effect immediately rather than waiting out the debounce. */
  onClear(): void {
    this.term.set('');
    this.searchChange.emit('');
  }
}
