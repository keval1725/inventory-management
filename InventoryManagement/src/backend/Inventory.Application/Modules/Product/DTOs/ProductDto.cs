namespace Inventory.Application.Modules.Product.DTOs;

public record ProductDto(Guid Id, string Name, string Sku, string? Category, bool IsActive, DateTime CreatedAt);
