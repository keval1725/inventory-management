export interface WarehouseDto {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  address: string;
}
