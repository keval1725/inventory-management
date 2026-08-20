using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using MediatR;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.Application.Modules.Product.Commands.CreateProduct;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly IProductRepository _repository;

    public CreateProductHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.ExistsBySkuAsync(request.Sku, cancellationToken))
        {
            return Result.Failure<Guid>($"A product with SKU '{request.Sku}' already exists.", ErrorCode.Conflict);
        }

        var product = new ProductEntity(request.Name, request.Sku, request.Category);
        await _repository.AddAsync(product, cancellationToken);

        return Result.Success(product.Id);
    }
}
