using FluentValidation;

namespace Inventory.Application.Modules.Warehouse.Queries.GetWarehouses;

public class GetWarehousesValidator : AbstractValidator<GetWarehousesQuery>
{
    public GetWarehousesValidator()
    {
        RuleFor(q => q.Page).GreaterThanOrEqualTo(1);
        RuleFor(q => q.PageSize).InclusiveBetween(1, 100);
    }
}
