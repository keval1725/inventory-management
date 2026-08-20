using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Warehouse.Commands.DeactivateWarehouse;

public record DeactivateWarehouseCommand(Guid Id) : ICommand<Result>;
