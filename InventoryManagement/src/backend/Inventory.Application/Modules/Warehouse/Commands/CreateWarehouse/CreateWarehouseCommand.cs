using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Warehouse.Commands.CreateWarehouse;

public record CreateWarehouseCommand(string Name, string Address) : ICommand<Result<Guid>>;
