namespace Inventory.Application.Modules.Stock.DTOs;

public record StockLevelDto(Guid Id, Guid ProductId, Guid WarehouseId, int Quantity, DateTime CreatedAt);
