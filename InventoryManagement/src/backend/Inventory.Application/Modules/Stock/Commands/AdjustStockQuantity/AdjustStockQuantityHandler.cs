using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Domain.Exceptions;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Stock.Commands.AdjustStockQuantity;

public class AdjustStockQuantityHandler : IRequestHandler<AdjustStockQuantityCommand, Result>
{
    private readonly IStockLevelRepository _repository;

    public AdjustStockQuantityHandler(IStockLevelRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(AdjustStockQuantityCommand request, CancellationToken cancellationToken)
    {
        var stockLevel = await _repository.GetByIdAsync(request.StockLevelId, cancellationToken);
        if (stockLevel is null)
        {
            return Result.Failure($"Stock level '{request.StockLevelId}' was not found.", ErrorCode.NotFound);
        }

        // Going negative is a normal, state-dependent business outcome here
        // (unlike a constructor invariant slipping past validation), so it's
        // translated to an expected Result failure rather than left to
        // bubble up as an unhandled DomainException.
        try
        {
            stockLevel.AdjustQuantity(request.Delta);
        }
        catch (DomainException ex)
        {
            return Result.Failure(ex.Message, ErrorCode.Validation);
        }

        return Result.Success();
    }
}
