import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateWarehouseRequest, PagedResult, WarehouseDto } from '@inventory/shared-types';

export const WarehouseActions = createActionGroup({
  source: 'Warehouse',
  events: {
    'Load Warehouses': props<{ page: number; pageSize: number }>(),
    'Load Warehouses Success': props<{ result: PagedResult<WarehouseDto> }>(),
    'Load Warehouses Failure': props<{ message: string }>(),

    'Create Warehouse': props<{ request: CreateWarehouseRequest }>(),
    'Create Warehouse Success': emptyProps(),
    'Create Warehouse Failure': props<{ message: string }>(),

    'Deactivate Warehouse': props<{ id: string }>(),
    'Deactivate Warehouse Success': props<{ id: string }>(),
    'Deactivate Warehouse Failure': props<{ message: string }>(),
  },
});
