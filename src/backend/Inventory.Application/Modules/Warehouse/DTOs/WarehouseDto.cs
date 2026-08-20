namespace Inventory.Application.Modules.Warehouse.DTOs;

public record WarehouseDto(Guid Id, string Name, string Address, bool IsActive, DateTime CreatedAt);
