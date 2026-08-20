import { WarehouseDto } from '@inventory/shared-types';
import { WarehouseActions } from './warehouse.actions';
import { initialWarehouseState, warehouseFeature } from './warehouse.reducer';

describe('warehouseFeature reducer', () => {
  const warehouse: WarehouseDto = {
    id: 'w1',
    name: 'Main DC',
    address: '123 Industrial Way',
    isActive: true,
    createdAt: '2026-08-18T00:00:00Z',
  };

  it('loadWarehouses sets loading true and clears error', () => {
    const state = warehouseFeature.reducer(
      { ...initialWarehouseState, error: 'previous error' },
      WarehouseActions.loadWarehouses({ page: 1, pageSize: 20 }),
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadWarehousesSuccess populates entities and pagination metadata', () => {
    const state = warehouseFeature.reducer(
      initialWarehouseState,
      WarehouseActions.loadWarehousesSuccess({
        result: { items: [warehouse], totalCount: 1, page: 1, pageSize: 20 },
      }),
    );

    expect(state.ids).toEqual(['w1']);
    expect(state.entities['w1']).toEqual(warehouse);
    expect(state.totalCount).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('deactivateWarehouseSuccess marks the matching entity inactive without removing it', () => {
    const loaded = warehouseFeature.reducer(
      initialWarehouseState,
      WarehouseActions.loadWarehousesSuccess({
        result: { items: [warehouse], totalCount: 1, page: 1, pageSize: 20 },
      }),
    );

    const state = warehouseFeature.reducer(loaded, WarehouseActions.deactivateWarehouseSuccess({ id: 'w1' }));

    expect(state.entities['w1']?.isActive).toBe(false);
    expect(state.ids).toEqual(['w1']);
  });

  it('loadWarehousesFailure records the error and stops loading', () => {
    const state = warehouseFeature.reducer(
      { ...initialWarehouseState, loading: true },
      WarehouseActions.loadWarehousesFailure({ message: 'network error' }),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('network error');
  });
});
