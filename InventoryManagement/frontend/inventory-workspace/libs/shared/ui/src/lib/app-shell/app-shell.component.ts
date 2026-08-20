import { A11yModule } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NavSection } from '@inventory/shared-types';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';
import { ShellNavComponent } from './shell-nav.component';

const CollapsedKey = 'inv.sidebar.collapsed';

/**
 * The application frame: an ink navigation column on the left, page content on
 * the right.
 *
 * There is deliberately no desktop top bar. In a tool people read for hours,
 * 56px of chrome repeated on every page buys nothing that the page header
 * doesn't already provide — so the only fixed chrome is the sidebar, and the
 * collapse toggle lives in it. Mobile gets a slim bar, because it needs
 * somewhere to put the menu button.
 *
 * `type:ui`, so it holds no store: navigation structure and the signed-in user
 * arrive as inputs and `logout` goes back out as an event.
 */
@Component({
  selector: 'inv-app-shell',
  standalone: true,
  imports: [A11yModule, IconComponent, ButtonDirective, ShellNavComponent],
  template: `
    <div class="flex min-h-screen">
      <aside
        class="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-ink-700 bg-ink transition-[width] duration-200 lg:flex"
        [class]="collapsed() ? 'w-rail' : 'w-sidebar'"
      >
        <inv-shell-nav
          [sections]="sections()"
          [collapsed]="collapsed()"
          [userName]="userName()"
          [userRole]="userRole()"
          (logout)="logout.emit()"
        />

        <button
          type="button"
          class="flex h-7 shrink-0 items-center justify-center border-t border-ink-700 text-steel-500 transition-colors hover:bg-ink-800 hover:text-steel-300"
          [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          [attr.aria-pressed]="collapsed()"
          (click)="toggleCollapsed()"
        >
          <inv-icon [name]="collapsed() ? 'chevrons-right' : 'chevrons-left'" [size]="13" />
        </button>
      </aside>

      @if (mobileOpen()) {
        <!-- A real button, not a div with a click handler: the backdrop is a
             dismiss control, so it should be reachable and labelled like one. -->
        <button
          type="button"
          aria-label="Close navigation"
          class="fixed inset-0 z-40 animate-fade-in bg-ink/40 lg:hidden"
          (click)="closeMobile()"
        ></button>

        <aside
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          class="fixed inset-y-0 left-0 z-50 flex w-sidebar animate-slide-in-left flex-col bg-ink shadow-overlay lg:hidden"
        >
          <inv-shell-nav
            [sections]="sections()"
            [userName]="userName()"
            [userRole]="userRole()"
            (navigated)="closeMobile()"
            (logout)="logout.emit()"
          />
        </aside>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-paper/95 px-2 backdrop-blur lg:hidden"
        >
          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Open navigation"
            (click)="mobileOpen.set(true)"
          >
            <inv-icon name="menu" [size]="18" />
          </button>

          <span class="flex h-6 w-6 items-center justify-center rounded bg-ink text-hazard">
            <inv-icon name="warehouse" [size]="13" />
          </span>
          <span class="text-md font-semibold">Inventory</span>
        </header>

        <main class="min-w-0 flex-1">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  host: { class: 'block', '(document:keydown.escape)': 'closeMobile()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly sections = input.required<readonly NavSection[]>();
  readonly userName = input('');
  readonly userRole = input<string>();

  readonly logout = output<void>();

  private readonly document = inject(DOCUMENT);

  /** A per-browser preference, not application state — it never leaves this component. */
  readonly collapsed = signal(this.readCollapsed());
  readonly mobileOpen = signal(false);

  constructor() {
    // The mobile slide-over isn't a CDK overlay, so it doesn't get scroll
    // blocking for free. Without this the page scrolls behind the panel.
    effect(() => {
      this.document.body.classList.toggle('overflow-hidden', this.mobileOpen());
    });
  }

  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);

    try {
      localStorage.setItem(CollapsedKey, String(next));
    } catch {
      // Private browsing or a full quota. A sidebar preference isn't worth an error.
    }
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(CollapsedKey) === 'true';
    } catch {
      return false;
    }
  }
}
