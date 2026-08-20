import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { productFeature, ProductEffects } from '@inventory/product-data-access';
import { ProductListComponent } from './product-list/product-list.component';

export const productFeatureRoutes: Route[] = [
  {
    path: '',
    component: ProductListComponent,
    providers: [provideState(productFeature), provideEffects(ProductEffects)],
  },
];
