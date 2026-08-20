using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Product.Commands.DeactivateProduct;

public class DeactivateProductHandler : IRequestHandler<DeactivateProductCommand, Result>
{
    private readonly IProductRepository _repository;

    public DeactivateProductHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeactivateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
        {
            return Result.Failure($"Product '{request.Id}' was not found.", ErrorCode.NotFound);
        }

        product.Deactivate();

        return Result.Success();
    }
}
