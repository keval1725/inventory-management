using Inventory.API.Common;
using Inventory.API.Controllers.Product.Requests;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Product.Commands.CreateProduct;
using Inventory.Application.Modules.Product.Commands.DeactivateProduct;
using Inventory.Application.Modules.Product.DTOs;
using Inventory.Application.Modules.Product.Queries.GetProductById;
using Inventory.Application.Modules.Product.Queries.GetProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers.Product;

[ApiController]
[Route("api/v1/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetProductsQuery(page, pageSize), cancellationToken);
        return result.ToActionResult();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id), cancellationToken);
        return result.ToActionResult();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Purchasing")]
    public async Task<ActionResult> CreateProduct(
        [FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateProductCommand(request.Name, request.Sku, request.Category), cancellationToken);

        if (!result.IsSuccess)
        {
            return result.ToActionResult().Result!;
        }

        return CreatedAtAction(nameof(GetProductById), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin,Purchasing")]
    public async Task<ActionResult> DeactivateProduct(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeactivateProductCommand(id), cancellationToken);
        return result.ToActionResult();
    }
}
