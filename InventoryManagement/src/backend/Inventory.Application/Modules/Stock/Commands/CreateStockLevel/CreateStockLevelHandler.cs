using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using MediatR;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;

namespace Inventory.Application.Modules.Stock.Commands.CreateStockLevel;

public class CreateStockLevelHandler : IRequestHandler<CreateStockLevelCommand, Result<Guid>>
{
    private readonly IStockLevelRepository _stockLevelRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public CreateStockLevelHandler(
        IStockLevelRepository stockLevelRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockLevelRepository = stockLevelRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<Guid>> Handle(CreateStockLevelCommand request, CancellationToken cancellationToken)
    {
        // Stock depends on Product/Warehouse "by Id reference only" (backend-architecture.md §3) —
        // existence is checked through their repositories, never a joined navigation.
        if (await _productRepository.GetByIdAsync(request.ProductId, cancellationToken) is null)
        {
            return Result.Failure<Guid>($"Product '{request.ProductId}' was not found.", ErrorCode.NotFound);
        }

        if (await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken) is null)
        {
            return Result.Failure<Guid>($"Warehouse '{request.WarehouseId}' was not found.", ErrorCode.NotFound);
        }

        var existing = await _stockLevelRepository.GetByProductAndWarehouseAsync(
            request.ProductId, request.WarehouseId, cancellationToken);
        if (existing is not null)
        {
            return Result.Failure<Guid>(
                $"A stock level for product '{request.ProductId}' in warehouse '{request.WarehouseId}' already exists.",
                ErrorCode.Conflict);
        }

        var stockLevel = new StockLevelEntity(request.ProductId, request.WarehouseId, request.InitialQuantity);
        await _stockLevelRepository.AddAsync(stockLevel, cancellationToken);

        return Result.Success(stockLevel.Id);
    }
}
