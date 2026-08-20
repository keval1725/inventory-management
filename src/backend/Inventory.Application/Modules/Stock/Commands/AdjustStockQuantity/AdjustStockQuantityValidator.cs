using FluentValidation;

namespace Inventory.Application.Modules.Stock.Commands.AdjustStockQuantity;

public class AdjustStockQuantityValidator : AbstractValidator<AdjustStockQuantityCommand>
{
    public AdjustStockQuantityValidator()
    {
        RuleFor(c => c.StockLevelId).NotEmpty();
        RuleFor(c => c.Delta).NotEqual(0);
    }
}
