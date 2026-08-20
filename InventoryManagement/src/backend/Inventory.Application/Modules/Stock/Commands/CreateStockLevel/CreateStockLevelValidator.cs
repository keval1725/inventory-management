using FluentValidation;

namespace Inventory.Application.Modules.Stock.Commands.CreateStockLevel;

public class CreateStockLevelValidator : AbstractValidator<CreateStockLevelCommand>
{
    public CreateStockLevelValidator()
    {
        RuleFor(c => c.ProductId).NotEmpty();
        RuleFor(c => c.WarehouseId).NotEmpty();
        RuleFor(c => c.InitialQuantity).GreaterThanOrEqualTo(0);
    }
}
