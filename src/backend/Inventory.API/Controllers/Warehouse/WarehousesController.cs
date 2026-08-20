using Inventory.API.Common;
using Inventory.API.Controllers.Warehouse.Requests;
using Inventory.Application.Common.Models;
using Inventory.Application.Modules.Warehouse.Commands.CreateWarehouse;
using Inventory.Application.Modules.Warehouse.Commands.DeactivateWarehouse;
using Inventory.Application.Modules.Warehouse.DTOs;
using Inventory.Application.Modules.Warehouse.Queries.GetWarehouseById;
using Inventory.Application.Modules.Warehouse.Queries.GetWarehouses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers.Warehouse;

[ApiController]
[Route("api/v1/warehouses")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WarehousesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WarehouseDto>>> GetWarehouses(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetWarehousesQuery(page, pageSize), cancellationToken);
        return result.ToActionResult();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WarehouseDto>> GetWarehouseById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetWarehouseByIdQuery(id), cancellationToken);
        return result.ToActionResult();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseStaff")]
    public async Task<ActionResult> CreateWarehouse(
        [FromBody] CreateWarehouseRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateWarehouseCommand(request.Name, request.Address), cancellationToken);

        if (!result.IsSuccess)
        {
            return result.ToActionResult().Result!;
        }

        return CreatedAtAction(nameof(GetWarehouseById), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin,WarehouseStaff")]
    public async Task<ActionResult> DeactivateWarehouse(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeactivateWarehouseCommand(id), cancellationToken);
        return result.ToActionResult();
    }
}
