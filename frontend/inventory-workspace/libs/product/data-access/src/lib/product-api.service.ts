import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateProductRequest, PagedResult, ProductDto } from '@inventory/shared-types';
import { API_BASE_URL } from '@inventory/shared-data-access';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getProducts(page: number, pageSize: number) {
    return this.http.get<PagedResult<ProductDto>>(`${this.baseUrl}/api/v1/products`, {
      params: { page, pageSize },
    });
  }

  createProduct(request: CreateProductRequest) {
    return this.http.post<{ id: string }>(`${this.baseUrl}/api/v1/products`, request);
  }

  deactivateProduct(id: string) {
    return this.http.patch<void>(`${this.baseUrl}/api/v1/products/${id}/deactivate`, {});
  }
}
