import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AppError } from '@inventory/shared-data-access';
import { WarehouseActions } from './warehouse.actions';
import { WarehouseApiService } from './warehouse-api.service';

@Injectable()
export class WarehouseEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(WarehouseApiService);

  loadWarehouses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WarehouseActions.loadWarehouses),
      switchMap(({ page, pageSize }) =>
        this.api.getWarehouses(page, pageSize).pipe(
          map((result) => WarehouseActions.loadWarehousesSuccess({ result })),
          catchError((error: AppError) => of(WarehouseActions.loadWarehousesFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  createWarehouse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WarehouseActions.createWarehouse),
      switchMap(({ request }) =>
        this.api.createWarehouse(request).pipe(
          map(() => WarehouseActions.createWarehouseSuccess()),
          catchError((error: AppError) => of(WarehouseActions.createWarehouseFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WarehouseActions.createWarehouseSuccess),
      map(() => WarehouseActions.loadWarehouses({ page: 1, pageSize: 20 })),
    ),
  );

  deactivateWarehouse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WarehouseActions.deactivateWarehouse),
      switchMap(({ id }) =>
        this.api.deactivateWarehouse(id).pipe(
          map(() => WarehouseActions.deactivateWarehouseSuccess({ id })),
          catchError((error: AppError) =>
            of(WarehouseActions.deactivateWarehouseFailure({ message: error.message })),
          ),
        ),
      ),
    ),
  );
}
