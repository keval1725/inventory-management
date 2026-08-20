export interface StockLevelDto {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: string;
}

export interface CreateStockLevelRequest {
  productId: string;
  warehouseId: string;
  initialQuantity: number;
}

export interface AdjustStockQuantityRequest {
  delta: number;
}
