using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Warehouse.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Warehouse.Queries.GetWarehouseById;

public record GetWarehouseByIdQuery(Guid Id) : IQuery<Result<WarehouseDto>>;
