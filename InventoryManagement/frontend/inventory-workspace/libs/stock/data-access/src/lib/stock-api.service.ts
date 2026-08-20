import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateStockLevelRequest, PagedResult, StockLevelDto } from '@inventory/shared-types';
import { API_BASE_URL } from '@inventory/shared-data-access';

@Injectable({ providedIn: 'root' })
export class StockApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getStockLevels(page: number, pageSize: number) {
    return this.http.get<PagedResult<StockLevelDto>>(`${this.baseUrl}/api/v1/stock-levels`, {
      params: { page, pageSize },
    });
  }

  createStockLevel(request: CreateStockLevelRequest) {
    return this.http.post<{ id: string }>(`${this.baseUrl}/api/v1/stock-levels`, request);
  }

  adjustQuantity(id: string, delta: number) {
    return this.http.patch<void>(`${this.baseUrl}/api/v1/stock-levels/${id}/adjust-quantity`, { delta });
  }
}
