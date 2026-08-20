export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string | null;
}
