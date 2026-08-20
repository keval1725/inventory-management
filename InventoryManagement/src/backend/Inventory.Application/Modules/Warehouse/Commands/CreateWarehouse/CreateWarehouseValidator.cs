using FluentValidation;

namespace Inventory.Application.Modules.Warehouse.Commands.CreateWarehouse;

public class CreateWarehouseValidator : AbstractValidator<CreateWarehouseCommand>
{
    public CreateWarehouseValidator()
    {
        RuleFor(c => c.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(c => c.Address)
            .NotEmpty()
            .MaximumLength(500);
    }
}
