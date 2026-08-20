using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Warehouse.Commands.DeactivateWarehouse;

public class DeactivateWarehouseHandler : IRequestHandler<DeactivateWarehouseCommand, Result>
{
    private readonly IWarehouseRepository _repository;

    public DeactivateWarehouseHandler(IWarehouseRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeactivateWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (warehouse is null)
        {
            return Result.Failure($"Warehouse '{request.Id}' was not found.", ErrorCode.NotFound);
        }

        warehouse.Deactivate();

        return Result.Success();
    }
}
