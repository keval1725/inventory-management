import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavSection } from '@inventory/shared-types';
import { TokenStorageService } from '@inventory/shared-data-access';
import { AppShellComponent } from '@inventory/shared-ui';

/**
 * Layout route for everything behind the sign-in wall. Sitting in the route tree
 * rather than in `AppComponent` means the shell is created on entry and destroyed
 * on sign-out, so it never has to watch navigation to work out whether to render.
 */
@Component({
  selector: 'inv-shell-layout',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent],
  template: `
    <inv-app-shell
      [sections]="sections"
      [userName]="user?.email ?? ''"
      [userRole]="user?.role"
      (logout)="onLogout()"
    >
      <router-outlet />
    </inv-app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly user = this.tokenStorage.getUser();

  /** Ungrouped while there are three destinations — section labels would only repeat them. */
  readonly sections: NavSection[] = [
    {
      items: [
        { label: 'Warehouses', route: '/warehouses', icon: 'warehouse' },
        { label: 'Products', route: '/products', icon: 'box' },
        { label: 'Stock levels', route: '/stock-levels', icon: 'layers' },
      ],
    },
  ];

  onLogout(): void {
    this.tokenStorage.clearToken();
    this.router.navigate(['/login']);
  }
}
