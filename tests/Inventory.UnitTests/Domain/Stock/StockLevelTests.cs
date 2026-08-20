using FluentAssertions;
using Inventory.Domain.Exceptions;
using Inventory.Domain.Modules.Stock.Entities;

namespace Inventory.UnitTests.Domain.Stock;

public class StockLevelTests
{
    private static readonly Guid ProductId = Guid.NewGuid();
    private static readonly Guid WarehouseId = Guid.NewGuid();

    [Fact]
    public void Constructor_ValidArgs_CreatesStockLevel()
    {
        var stockLevel = new StockLevel(ProductId, WarehouseId, 100);

        stockLevel.ProductId.Should().Be(ProductId);
        stockLevel.WarehouseId.Should().Be(WarehouseId);
        stockLevel.Quantity.Should().Be(100);
    }

    [Fact]
    public void Constructor_NegativeInitialQuantity_ThrowsDomainException()
    {
        var act = () => new StockLevel(ProductId, WarehouseId, -1);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_EmptyProductId_ThrowsDomainException()
    {
        var act = () => new StockLevel(Guid.Empty, WarehouseId, 10);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_EmptyWarehouseId_ThrowsDomainException()
    {
        var act = () => new StockLevel(ProductId, Guid.Empty, 10);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void AdjustQuantity_PositiveDelta_IncreasesQuantity()
    {
        var stockLevel = new StockLevel(ProductId, WarehouseId, 100);

        stockLevel.AdjustQuantity(50);

        stockLevel.Quantity.Should().Be(150);
    }

    [Fact]
    public void AdjustQuantity_NegativeDeltaWithinStock_DecreasesQuantity()
    {
        var stockLevel = new StockLevel(ProductId, WarehouseId, 100);

        stockLevel.AdjustQuantity(-40);

        stockLevel.Quantity.Should().Be(60);
    }

    [Fact]
    public void AdjustQuantity_NegativeDeltaExceedingStock_ThrowsDomainExceptionAndLeavesQuantityUnchanged()
    {
        var stockLevel = new StockLevel(ProductId, WarehouseId, 10);

        var act = () => stockLevel.AdjustQuantity(-11);

        act.Should().Throw<DomainException>();
        stockLevel.Quantity.Should().Be(10);
    }
}
