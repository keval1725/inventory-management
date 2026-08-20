import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateProductRequest, PagedResult, ProductDto } from '@inventory/shared-types';

export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    'Load Products': props<{ page: number; pageSize: number }>(),
    'Load Products Success': props<{ result: PagedResult<ProductDto> }>(),
    'Load Products Failure': props<{ message: string }>(),

    'Create Product': props<{ request: CreateProductRequest }>(),
    'Create Product Success': emptyProps(),
    'Create Product Failure': props<{ message: string }>(),

    'Deactivate Product': props<{ id: string }>(),
    'Deactivate Product Success': props<{ id: string }>(),
    'Deactivate Product Failure': props<{ message: string }>(),
  },
});
