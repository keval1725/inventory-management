import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateWarehouseRequest, PagedResult, WarehouseDto } from '@inventory/shared-types';
import { API_BASE_URL } from '@inventory/shared-data-access';

@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getWarehouses(page: number, pageSize: number) {
    return this.http.get<PagedResult<WarehouseDto>>(`${this.baseUrl}/api/v1/warehouses`, {
      params: { page, pageSize },
    });
  }

  createWarehouse(request: CreateWarehouseRequest) {
    return this.http.post<{ id: string }>(`${this.baseUrl}/api/v1/warehouses`, request);
  }

  deactivateWarehouse(id: string) {
    return this.http.patch<void>(`${this.baseUrl}/api/v1/warehouses/${id}/deactivate`, {});
  }
}
