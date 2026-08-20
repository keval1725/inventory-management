import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AppError } from '@inventory/shared-data-access';
import { ProductActions } from './product.actions';
import { ProductApiService } from './product-api.service';

@Injectable()
export class ProductEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ProductApiService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(({ page, pageSize }) =>
        this.api.getProducts(page, pageSize).pipe(
          map((result) => ProductActions.loadProductsSuccess({ result })),
          catchError((error: AppError) => of(ProductActions.loadProductsFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      switchMap(({ request }) =>
        this.api.createProduct(request).pipe(
          map(() => ProductActions.createProductSuccess()),
          catchError((error: AppError) => of(ProductActions.createProductFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProductSuccess),
      map(() => ProductActions.loadProducts({ page: 1, pageSize: 20 })),
    ),
  );

  deactivateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deactivateProduct),
      switchMap(({ id }) =>
        this.api.deactivateProduct(id).pipe(
          map(() => ProductActions.deactivateProductSuccess({ id })),
          catchError((error: AppError) => of(ProductActions.deactivateProductFailure({ message: error.message }))),
        ),
      ),
    ),
  );
}
