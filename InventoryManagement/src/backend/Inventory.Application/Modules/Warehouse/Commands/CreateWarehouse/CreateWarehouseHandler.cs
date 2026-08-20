using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using MediatR;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.Application.Modules.Warehouse.Commands.CreateWarehouse;

public class CreateWarehouseHandler : IRequestHandler<CreateWarehouseCommand, Result<Guid>>
{
    private readonly IWarehouseRepository _repository;

    public CreateWarehouseHandler(IWarehouseRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateWarehouseCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.ExistsByNameAsync(request.Name, cancellationToken))
        {
            return Result.Failure<Guid>($"A warehouse named '{request.Name}' already exists.", ErrorCode.Conflict);
        }

        var warehouse = new WarehouseEntity(request.Name, request.Address);
        await _repository.AddAsync(warehouse, cancellationToken);

        return Result.Success(warehouse.Id);
    }
}
