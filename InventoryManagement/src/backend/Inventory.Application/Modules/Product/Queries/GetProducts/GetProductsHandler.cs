using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Product.DTOs;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Product.Queries.GetProducts;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductDto>>>
{
    private readonly IProductRepository _repository;

    public GetProductsHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<ProductDto>>> Handle(
        GetProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAsync(request.Page, request.PageSize, cancellationToken);

        var dtos = items
            .Select(p => new ProductDto(p.Id, p.Name, p.Sku, p.Category, p.IsActive, p.CreatedAt))
            .ToList();

        var pagedResult = new PagedResult<ProductDto>(dtos, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedResult);
    }
}
