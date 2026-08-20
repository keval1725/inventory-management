import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WarehouseActions, warehouseFeature } from '@inventory/warehouse-data-access';

@Component({
  selector: 'inv-warehouse-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './warehouse-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  readonly warehouses = this.store.selectSignal(warehouseFeature.selectAll);
  readonly loading = this.store.selectSignal(warehouseFeature.selectLoading);
  readonly error = this.store.selectSignal(warehouseFeature.selectError);

  ngOnInit(): void {
    this.store.dispatch(WarehouseActions.loadWarehouses({ page: 1, pageSize: 20 }));
  }

  onCreate(): void {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(WarehouseActions.createWarehouse({ request: this.form.getRawValue() }));
    this.form.reset();
  }

  onDeactivate(id: string): void {
    this.store.dispatch(WarehouseActions.deactivateWarehouse({ id }));
  }
}
