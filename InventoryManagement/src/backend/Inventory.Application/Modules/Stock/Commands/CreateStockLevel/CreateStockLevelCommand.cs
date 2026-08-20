using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Stock.Commands.CreateStockLevel;

public record CreateStockLevelCommand(Guid ProductId, Guid WarehouseId, int InitialQuantity) : ICommand<Result<Guid>>;
