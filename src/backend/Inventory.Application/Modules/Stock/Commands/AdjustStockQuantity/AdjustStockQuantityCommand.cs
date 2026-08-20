using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Stock.Commands.AdjustStockQuantity;

public record AdjustStockQuantityCommand(Guid StockLevelId, int Delta) : ICommand<Result>;
