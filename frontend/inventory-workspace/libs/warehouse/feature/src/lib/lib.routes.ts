import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { warehouseFeature, WarehouseEffects } from '@inventory/warehouse-data-access';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';

export const warehouseFeatureRoutes: Route[] = [
  {
    path: '',
    component: WarehouseListComponent,
    providers: [provideState(warehouseFeature), provideEffects(WarehouseEffects)],
  },
];
