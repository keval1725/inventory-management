using Inventory.API.Common;
using Inventory.API.Controllers.Stock.Requests;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Stock.Commands.AdjustStockQuantity;
using Inventory.Application.Modules.Stock.Commands.CreateStockLevel;
using Inventory.Application.Modules.Stock.DTOs;
using Inventory.Application.Modules.Stock.Queries.GetStockLevelById;
using Inventory.Application.Modules.Stock.Queries.GetStockLevels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers.Stock;

[ApiController]
[Route("api/v1/stock-levels")]
[Authorize]
public class StockLevelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockLevelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StockLevelDto>>> GetStockLevels(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] Guid? productId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetStockLevelsQuery(page, pageSize, warehouseId, productId), cancellationToken);
        return result.ToActionResult();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StockLevelDto>> GetStockLevelById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockLevelByIdQuery(id), cancellationToken);
        return result.ToActionResult();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseStaff")]
    public async Task<ActionResult> CreateStockLevel(
        [FromBody] CreateStockLevelRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateStockLevelCommand(request.ProductId, request.WarehouseId, request.InitialQuantity),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return result.ToActionResult().Result!;
        }

        return CreatedAtAction(nameof(GetStockLevelById), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPatch("{id:guid}/adjust-quantity")]
    [Authorize(Roles = "Admin,WarehouseStaff")]
    public async Task<ActionResult> AdjustQuantity(
        Guid id, [FromBody] AdjustStockQuantityRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AdjustStockQuantityCommand(id, request.Delta), cancellationToken);
        return result.ToActionResult();
    }
}
