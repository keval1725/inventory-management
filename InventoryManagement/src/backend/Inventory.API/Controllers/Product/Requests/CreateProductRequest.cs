namespace Inventory.API.Controllers.Product.Requests;

public record CreateProductRequest(string Name, string Sku, string? Category);
