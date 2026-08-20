using FluentAssertions;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Application.Modules.Stock.Commands.CreateStockLevel;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using Moq;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Application.Stock;

public class CreateStockLevelHandlerTests
{
    private readonly Mock<IStockLevelRepository> _stockLevelRepository = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IWarehouseRepository> _warehouseRepository = new();

    private CreateStockLevelHandler CreateHandler() =>
        new(_stockLevelRepository.Object, _productRepository.Object, _warehouseRepository.Object);

    private void SetUpExistingProductAndWarehouse(Guid productId, Guid warehouseId)
    {
        _productRepository.Setup(r => r.GetByIdAsync(productId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProductEntity("Widget", "SKU-001", null));
        _warehouseRepository.Setup(r => r.GetByIdAsync(warehouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WarehouseEntity("Main DC", "123 Industrial Way"));
    }

    [Fact]
    public async Task Handle_ProductAndWarehouseExistNoDuplicate_CreatesStockLevel()
    {
        var productId = Guid.NewGuid();
        var warehouseId = Guid.NewGuid();
        SetUpExistingProductAndWarehouse(productId, warehouseId);
        _stockLevelRepository
            .Setup(r => r.GetByProductAndWarehouseAsync(productId, warehouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockLevelEntity?)null);

        var result = await CreateHandler().Handle(
            new CreateStockLevelCommand(productId, warehouseId, 50), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _stockLevelRepository.Verify(
            r => r.AddAsync(It.Is<StockLevelEntity>(s => s.Quantity == 50), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ProductDoesNotExist_ReturnsNotFound()
    {
        var productId = Guid.NewGuid();
        var warehouseId = Guid.NewGuid();
        _productRepository.Setup(r => r.GetByIdAsync(productId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductEntity?)null);

        var result = await CreateHandler().Handle(
            new CreateStockLevelCommand(productId, warehouseId, 50), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
        _stockLevelRepository.Verify(
            r => r.AddAsync(It.IsAny<StockLevelEntity>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WarehouseDoesNotExist_ReturnsNotFound()
    {
        var productId = Guid.NewGuid();
        var warehouseId = Guid.NewGuid();
        _productRepository.Setup(r => r.GetByIdAsync(productId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProductEntity("Widget", "SKU-001", null));
        _warehouseRepository.Setup(r => r.GetByIdAsync(warehouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((WarehouseEntity?)null);

        var result = await CreateHandler().Handle(
            new CreateStockLevelCommand(productId, warehouseId, 50), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
    }

    [Fact]
    public async Task Handle_StockLevelAlreadyExistsForPair_ReturnsConflict()
    {
        var productId = Guid.NewGuid();
        var warehouseId = Guid.NewGuid();
        SetUpExistingProductAndWarehouse(productId, warehouseId);
        _stockLevelRepository
            .Setup(r => r.GetByProductAndWarehouseAsync(productId, warehouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StockLevelEntity(productId, warehouseId, 10));

        var result = await CreateHandler().Handle(
            new CreateStockLevelCommand(productId, warehouseId, 50), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Conflict);
    }
}
