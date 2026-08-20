using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Warehouse.DTOs;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Warehouse.Queries.GetWarehouses;

public class GetWarehousesHandler : IRequestHandler<GetWarehousesQuery, Result<PagedResult<WarehouseDto>>>
{
    private readonly IWarehouseRepository _repository;

    public GetWarehousesHandler(IWarehouseRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<WarehouseDto>>> Handle(
        GetWarehousesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(request.Page, request.PageSize, cancellationToken);

        var dtos = items
            .Select(w => new WarehouseDto(w.Id, w.Name, w.Address, w.IsActive, w.CreatedAt))
            .ToList();

        var pagedResult = new PagedResult<WarehouseDto>(dtos, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedResult);
    }
}
