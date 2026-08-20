using FluentValidation;

namespace Inventory.Application.Modules.Product.Commands.CreateProduct;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(c => c.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(c => c.Sku)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(c => c.Category)
            .MaximumLength(100);
    }
}
