import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { StockActions, stockFeature } from '@inventory/stock-data-access';

@Component({
  selector: 'inv-stock-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stock-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    productId: ['', Validators.required],
    warehouseId: ['', Validators.required],
    initialQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  readonly stockLevels = this.store.selectSignal(stockFeature.selectAll);
  readonly loading = this.store.selectSignal(stockFeature.selectLoading);
  readonly error = this.store.selectSignal(stockFeature.selectError);

  ngOnInit(): void {
    this.store.dispatch(StockActions.loadStockLevels({ page: 1, pageSize: 20 }));
  }

  onCreate(): void {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(StockActions.createStockLevel({ request: this.form.getRawValue() }));
    this.form.reset({ initialQuantity: 0 });
  }

  onAdjust(id: string, delta: number): void {
    this.store.dispatch(StockActions.adjustQuantity({ id, delta }));
  }
}
