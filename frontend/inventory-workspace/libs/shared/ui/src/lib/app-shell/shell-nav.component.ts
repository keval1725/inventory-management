import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavSection } from '@inventory/shared-types';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

function initialsFrom(name: string): string {
  const local = name.split('@')[0] ?? name;

  return (
    local
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

/**
 * The whole interior of the sidebar — masthead, navigation, account block.
 *
 * Extracted from the shell because it is rendered twice: once as the static
 * desktop column and once inside the mobile slide-over. Not exported from the
 * library; the shell is the public surface.
 */
@Component({
  selector: 'inv-shell-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, ButtonDirective],
  template: `
    <div class="flex h-topbar shrink-0 items-center gap-2.5 border-b border-ink-700 px-3">
      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-hazard text-ink">
        <inv-icon name="warehouse" [size]="16" />
      </span>
      @if (!collapsed()) {
        <div class="min-w-0">
          <p class="truncate text-base font-semibold leading-tight text-white">Inventory</p>
          <p class="truncate text-2xs uppercase text-steel-500">Warehouse ops</p>
        </div>
      }
    </div>

    <nav class="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
      @for (section of sections(); track section.label ?? $index) {
        <div class="mb-4 last:mb-0">
          @if (section.label && !collapsed()) {
            <p class="micro-label px-2.5 pb-1.5">{{ section.label }}</p>
          }

          <ul class="space-y-0.5">
            @for (item of section.items; track item.route) {
              <li>
                <a
                  [routerLink]="item.route"
                  routerLinkActive
                  #link="routerLinkActive"
                  [attr.aria-current]="link.isActive ? 'page' : null"
                  [attr.title]="collapsed() ? item.label : null"
                  (click)="navigated.emit()"
                  class="relative flex h-8 items-center gap-2.5 rounded px-2.5 text-base transition-colors"
                  [class]="
                    link.isActive
                      ? 'bg-ink-700 font-medium text-white'
                      : 'text-steel-300 hover:bg-ink-800 hover:text-white'
                  "
                >
                  <!-- Safety tape marks the current location. The only decorative-looking
                       use of hazard in the app, and it is not decorative. -->
                  @if (link.isActive) {
                    <span class="absolute inset-y-1 left-0 w-0.5 rounded-full bg-hazard" aria-hidden="true"></span>
                  }
                  <inv-icon [name]="item.icon" [size]="16" />
                  <span [class]="collapsed() ? 'sr-only' : 'truncate'">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        </div>
      }
    </nav>

    <div class="shrink-0 border-t border-ink-700 p-2">
      <div class="flex items-center gap-2.5" [class]="collapsed() ? 'flex-col' : 'px-1'">
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-600 text-2xs font-semibold tracking-normal text-steel-200"
          [attr.title]="collapsed() ? userName() : null"
        >
          {{ initials() }}
        </span>

        @if (!collapsed()) {
          <div class="min-w-0 flex-1 py-0.5">
            <p class="truncate text-xs font-medium text-white">{{ userName() }}</p>
            @if (userRole()) {
              <p class="truncate text-2xs uppercase text-steel-500">{{ userRole() }}</p>
            }
          </div>
        }

        <button
          type="button"
          invButton
          variant="ghost-inverse"
          size="sm"
          iconOnly
          aria-label="Sign out"
          title="Sign out"
          (click)="logout.emit()"
        >
          <inv-icon name="log-out" [size]="15" />
        </button>
      </div>
    </div>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellNavComponent {
  readonly sections = input.required<readonly NavSection[]>();
  readonly collapsed = input(false);
  readonly userName = input('');
  readonly userRole = input<string>();

  readonly logout = output<void>();
  /** A nav link was followed — the mobile slide-over uses this to close itself. */
  readonly navigated = output<void>();

  readonly initials = computed(() => initialsFrom(this.userName()));
}
