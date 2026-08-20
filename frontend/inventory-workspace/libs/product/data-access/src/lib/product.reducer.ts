import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { ProductDto } from '@inventory/shared-types';
import { ProductActions } from './product.actions';

export interface ProductState extends EntityState<ProductDto> {
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const productAdapter = createEntityAdapter<ProductDto>();

export const initialProductState: ProductState = productAdapter.getInitialState({
  totalCount: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
});

export const productFeature = createFeature({
  name: 'product',
  reducer: createReducer(
    initialProductState,
    on(ProductActions.loadProducts, (state) => ({ ...state, loading: true, error: null })),
    on(ProductActions.loadProductsSuccess, (state, { result }) =>
      productAdapter.setAll(result.items, {
        ...state,
        loading: false,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      }),
    ),
    on(ProductActions.loadProductsFailure, (state, { message }) => ({ ...state, loading: false, error: message })),
    on(ProductActions.createProductFailure, (state, { message }) => ({ ...state, error: message })),
    on(ProductActions.deactivateProductSuccess, (state, { id }) =>
      productAdapter.updateOne({ id, changes: { isActive: false } }, state),
    ),
    on(ProductActions.deactivateProductFailure, (state, { message }) => ({ ...state, error: message })),
  ),
  extraSelectors: ({ selectProductState }) => ({
    ...productAdapter.getSelectors(selectProductState),
  }),
});
