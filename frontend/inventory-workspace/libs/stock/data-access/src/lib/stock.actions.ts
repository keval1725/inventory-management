import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateStockLevelRequest, PagedResult, StockLevelDto } from '@inventory/shared-types';

export const StockActions = createActionGroup({
  source: 'Stock',
  events: {
    'Load Stock Levels': props<{ page: number; pageSize: number }>(),
    'Load Stock Levels Success': props<{ result: PagedResult<StockLevelDto> }>(),
    'Load Stock Levels Failure': props<{ message: string }>(),

    'Create Stock Level': props<{ request: CreateStockLevelRequest }>(),
    'Create Stock Level Success': emptyProps(),
    'Create Stock Level Failure': props<{ message: string }>(),

    'Adjust Quantity': props<{ id: string; delta: number }>(),
    'Adjust Quantity Success': props<{ id: string; delta: number }>(),
    'Adjust Quantity Failure': props<{ message: string }>(),
  },
});
