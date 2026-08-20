import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ProductActions, productFeature } from '@inventory/product-data-access';

@Component({
  selector: 'inv-product-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    category: [''],
  });

  readonly products = this.store.selectSignal(productFeature.selectAll);
  readonly loading = this.store.selectSignal(productFeature.selectLoading);
  readonly error = this.store.selectSignal(productFeature.selectError);

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts({ page: 1, pageSize: 20 }));
  }

  onCreate(): void {
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      ProductActions.createProduct({ request: { name: raw.name, sku: raw.sku, category: raw.category || null } }),
    );
    this.form.reset();
  }

  onDeactivate(id: string): void {
    this.store.dispatch(ProductActions.deactivateProduct({ id }));
  }
}
