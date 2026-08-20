using Inventory.Application.Common.Interfaces;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Warehouse.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Warehouse.Queries.GetWarehouses;

public record GetWarehousesQuery(int Page = 1, int PageSize = 20) : IQuery<Result<PagedResult<WarehouseDto>>>;
