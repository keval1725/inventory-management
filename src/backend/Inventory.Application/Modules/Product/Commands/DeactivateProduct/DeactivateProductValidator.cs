using FluentValidation;

namespace Inventory.Application.Modules.Product.Commands.DeactivateProduct;

public class DeactivateProductValidator : AbstractValidator<DeactivateProductCommand>
{
    public DeactivateProductValidator()
    {
        RuleFor(c => c.Id).NotEmpty();
    }
}
