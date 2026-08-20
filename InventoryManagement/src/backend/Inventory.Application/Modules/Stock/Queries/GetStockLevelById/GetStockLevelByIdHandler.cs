using Inventory.Application.Modules.Stock.DTOs;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Stock.Queries.GetStockLevelById;

public class GetStockLevelByIdHandler : IRequestHandler<GetStockLevelByIdQuery, Result<StockLevelDto>>
{
    private readonly IStockLevelRepository _repository;

    public GetStockLevelByIdHandler(IStockLevelRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<StockLevelDto>> Handle(GetStockLevelByIdQuery request, CancellationToken cancellationToken)
    {
        var stockLevel = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (stockLevel is null)
        {
            return Result.Failure<StockLevelDto>($"Stock level '{request.Id}' was not found.", ErrorCode.NotFound);
        }

        var dto = new StockLevelDto(
            stockLevel.Id, stockLevel.ProductId, stockLevel.WarehouseId, stockLevel.Quantity, stockLevel.CreatedAt);
        return Result.Success(dto);
    }
}
