import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { WarehouseDto } from '@inventory/shared-types';
import { WarehouseActions } from './warehouse.actions';

export interface WarehouseState extends EntityState<WarehouseDto> {
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const warehouseAdapter = createEntityAdapter<WarehouseDto>();

export const initialWarehouseState: WarehouseState = warehouseAdapter.getInitialState({
  totalCount: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
});

export const warehouseFeature = createFeature({
  name: 'warehouse',
  reducer: createReducer(
    initialWarehouseState,
    on(WarehouseActions.loadWarehouses, (state) => ({ ...state, loading: true, error: null })),
    on(WarehouseActions.loadWarehousesSuccess, (state, { result }) =>
      warehouseAdapter.setAll(result.items, {
        ...state,
        loading: false,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      }),
    ),
    on(WarehouseActions.loadWarehousesFailure, (state, { message }) => ({
      ...state,
      loading: false,
      error: message,
    })),
    on(WarehouseActions.createWarehouseFailure, (state, { message }) => ({ ...state, error: message })),
    on(WarehouseActions.deactivateWarehouseSuccess, (state, { id }) =>
      warehouseAdapter.updateOne({ id, changes: { isActive: false } }, state),
    ),
    on(WarehouseActions.deactivateWarehouseFailure, (state, { message }) => ({ ...state, error: message })),
  ),
  extraSelectors: ({ selectWarehouseState }) => ({
    ...warehouseAdapter.getSelectors(selectWarehouseState),
  }),
});
