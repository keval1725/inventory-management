using Inventory.Application.Common.Interfaces;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Stock.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Stock.Queries.GetStockLevels;

public record GetStockLevelsQuery(
    int Page = 1, int PageSize = 20, Guid? WarehouseId = null, Guid? ProductId = null)
    : IQuery<Result<PagedResult<StockLevelDto>>>;
