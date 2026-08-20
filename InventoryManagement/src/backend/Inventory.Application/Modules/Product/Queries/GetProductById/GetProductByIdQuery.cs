using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Product.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Product.Queries.GetProductById;

public record GetProductByIdQuery(Guid Id) : IQuery<Result<ProductDto>>;
