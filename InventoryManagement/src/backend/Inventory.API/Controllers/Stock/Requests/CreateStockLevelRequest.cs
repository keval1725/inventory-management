namespace Inventory.API.Controllers.Stock.Requests;

public record CreateStockLevelRequest(Guid ProductId, Guid WarehouseId, int InitialQuantity);
