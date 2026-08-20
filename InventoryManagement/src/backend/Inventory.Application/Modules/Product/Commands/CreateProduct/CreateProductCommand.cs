using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Product.Commands.CreateProduct;

public record CreateProductCommand(string Name, string Sku, string? Category) : ICommand<Result<Guid>>;
