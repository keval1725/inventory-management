using Inventory.Application.Modules.Warehouse.DTOs;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Warehouse.Queries.GetWarehouseById;

public class GetWarehouseByIdHandler : IRequestHandler<GetWarehouseByIdQuery, Result<WarehouseDto>>
{
    private readonly IWarehouseRepository _repository;

    public GetWarehouseByIdHandler(IWarehouseRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<WarehouseDto>> Handle(GetWarehouseByIdQuery request, CancellationToken cancellationToken)
    {
        var warehouse = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (warehouse is null)
        {
            return Result.Failure<WarehouseDto>($"Warehouse '{request.Id}' was not found.", ErrorCode.NotFound);
        }

        var dto = new WarehouseDto(warehouse.Id, warehouse.Name, warehouse.Address, warehouse.IsActive, warehouse.CreatedAt);
        return Result.Success(dto);
    }
}
