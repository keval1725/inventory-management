import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { StockLevelDto } from '@inventory/shared-types';
import { StockActions } from './stock.actions';

export interface StockState extends EntityState<StockLevelDto> {
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const stockAdapter = createEntityAdapter<StockLevelDto>();

export const initialStockState: StockState = stockAdapter.getInitialState({
  totalCount: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
});

export const stockFeature = createFeature({
  name: 'stock',
  reducer: createReducer(
    initialStockState,
    on(StockActions.loadStockLevels, (state) => ({ ...state, loading: true, error: null })),
    on(StockActions.loadStockLevelsSuccess, (state, { result }) =>
      stockAdapter.setAll(result.items, {
        ...state,
        loading: false,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      }),
    ),
    on(StockActions.loadStockLevelsFailure, (state, { message }) => ({ ...state, loading: false, error: message })),
    on(StockActions.createStockLevelFailure, (state, { message }) => ({ ...state, error: message })),
    on(StockActions.adjustQuantitySuccess, (state, { id, delta }) => {
      const current = state.entities[id];
      if (!current) {
        return state;
      }
      return stockAdapter.updateOne({ id, changes: { quantity: current.quantity + delta } }, state);
    }),
    on(StockActions.adjustQuantityFailure, (state, { message }) => ({ ...state, error: message })),
  ),
  extraSelectors: ({ selectStockState }) => ({
    ...stockAdapter.getSelectors(selectStockState),
  }),
});
