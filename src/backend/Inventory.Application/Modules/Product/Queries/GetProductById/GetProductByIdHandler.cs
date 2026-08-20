using Inventory.Application.Modules.Product.DTOs;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Product.Queries.GetProductById;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IProductRepository _repository;

    public GetProductByIdHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
        {
            return Result.Failure<ProductDto>($"Product '{request.Id}' was not found.", ErrorCode.NotFound);
        }

        var dto = new ProductDto(product.Id, product.Name, product.Sku, product.Category, product.IsActive, product.CreatedAt);
        return Result.Success(dto);
    }
}
