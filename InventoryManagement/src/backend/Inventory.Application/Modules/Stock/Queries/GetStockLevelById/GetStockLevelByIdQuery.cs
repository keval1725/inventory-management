using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Stock.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Stock.Queries.GetStockLevelById;

public record GetStockLevelByIdQuery(Guid Id) : IQuery<Result<StockLevelDto>>;
