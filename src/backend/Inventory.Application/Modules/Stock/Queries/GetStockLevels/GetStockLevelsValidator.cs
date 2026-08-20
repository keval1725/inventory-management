using FluentValidation;

namespace Inventory.Application.Modules.Stock.Queries.GetStockLevels;

public class GetStockLevelsValidator : AbstractValidator<GetStockLevelsQuery>
{
    public GetStockLevelsValidator()
    {
        RuleFor(q => q.Page).GreaterThanOrEqualTo(1);
        RuleFor(q => q.PageSize).InclusiveBetween(1, 100);
    }
}
