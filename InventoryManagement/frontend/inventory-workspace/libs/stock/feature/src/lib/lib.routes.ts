import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { stockFeature, StockEffects } from '@inventory/stock-data-access';
import { StockListComponent } from './stock-list/stock-list.component';

export const stockFeatureRoutes: Route[] = [
  {
    path: '',
    component: StockListComponent,
    providers: [provideState(stockFeature), provideEffects(StockEffects)],
  },
];
