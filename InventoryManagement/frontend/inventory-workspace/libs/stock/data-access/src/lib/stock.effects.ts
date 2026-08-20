import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AppError } from '@inventory/shared-data-access';
import { StockActions } from './stock.actions';
import { StockApiService } from './stock-api.service';

@Injectable()
export class StockEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(StockApiService);

  loadStockLevels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadStockLevels),
      switchMap(({ page, pageSize }) =>
        this.api.getStockLevels(page, pageSize).pipe(
          map((result) => StockActions.loadStockLevelsSuccess({ result })),
          catchError((error: AppError) => of(StockActions.loadStockLevelsFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  createStockLevel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.createStockLevel),
      switchMap(({ request }) =>
        this.api.createStockLevel(request).pipe(
          map(() => StockActions.createStockLevelSuccess()),
          catchError((error: AppError) => of(StockActions.createStockLevelFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.createStockLevelSuccess),
      map(() => StockActions.loadStockLevels({ page: 1, pageSize: 20 })),
    ),
  );

  adjustQuantity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.adjustQuantity),
      switchMap(({ id, delta }) =>
        this.api.adjustQuantity(id, delta).pipe(
          map(() => StockActions.adjustQuantitySuccess({ id, delta })),
          catchError((error: AppError) => of(StockActions.adjustQuantityFailure({ message: error.message }))),
        ),
      ),
    ),
  );
}
