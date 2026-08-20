import { Route } from '@angular/router';
import { authGuard } from '@inventory/shared-data-access';
import { ShellLayoutComponent } from './layout/shell-layout.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadChildren: () => import('@inventory/identity-feature').then((m) => m.identityFeatureRoutes),
  },
  {
    // The guard sits on the layout route, so an unauthenticated visitor never
    // gets as far as rendering the shell around an empty page.
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'warehouses' },
      {
        path: 'warehouses',
        loadChildren: () => import('@inventory/warehouse-feature').then((m) => m.warehouseFeatureRoutes),
      },
      {
        path: 'products',
        loadChildren: () => import('@inventory/product-feature').then((m) => m.productFeatureRoutes),
      },
      {
        path: 'stock-levels',
        loadChildren: () => import('@inventory/stock-feature').then((m) => m.stockFeatureRoutes),
      },
    ],
  },
];
