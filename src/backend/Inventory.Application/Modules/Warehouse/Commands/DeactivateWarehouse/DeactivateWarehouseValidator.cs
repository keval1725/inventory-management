using FluentValidation;

namespace Inventory.Application.Modules.Warehouse.Commands.DeactivateWarehouse;

public class DeactivateWarehouseValidator : AbstractValidator<DeactivateWarehouseCommand>
{
    public DeactivateWarehouseValidator()
    {
        RuleFor(c => c.Id).NotEmpty();
    }
}
