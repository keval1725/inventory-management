using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Stock.DTOs;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Stock.Queries.GetStockLevels;

public class GetStockLevelsHandler : IRequestHandler<GetStockLevelsQuery, Result<PagedResult<StockLevelDto>>>
{
    private readonly IStockLevelRepository _repository;

    public GetStockLevelsHandler(IStockLevelRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<StockLevelDto>>> Handle(
        GetStockLevelsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(
            request.Page, request.PageSize, request.WarehouseId, request.ProductId, cancellationToken);

        var dtos = items
            .Select(s => new StockLevelDto(s.Id, s.ProductId, s.WarehouseId, s.Quantity, s.CreatedAt))
            .ToList();

        var pagedResult = new PagedResult<StockLevelDto>(dtos, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedResult);
    }
}
