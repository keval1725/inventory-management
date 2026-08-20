using Inventory.Application.Common.Interfaces;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Product.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Product.Queries.GetProducts;

public record GetProductsQuery(int Page = 1, int PageSize = 20) : IQuery<Result<PagedResult<ProductDto>>>;
