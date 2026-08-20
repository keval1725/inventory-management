using FluentAssertions;
using Inventory.Application.Modules.Stock.Commands.AdjustStockQuantity;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Shared.Results;
using Moq;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;

namespace Inventory.UnitTests.Application.Stock;

public class AdjustStockQuantityHandlerTests
{
    private readonly Mock<IStockLevelRepository> _repository = new();

    [Fact]
    public async Task Handle_PositiveDeltaWithinBounds_IncreasesQuantity()
    {
        var stockLevel = new StockLevelEntity(Guid.NewGuid(), Guid.NewGuid(), 100);
        _repository.Setup(r => r.GetByIdAsync(stockLevel.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stockLevel);

        var handler = new AdjustStockQuantityHandler(_repository.Object);
        var result = await handler.Handle(new AdjustStockQuantityCommand(stockLevel.Id, 25), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        stockLevel.Quantity.Should().Be(125);
    }

    [Fact]
    public async Task Handle_DeltaWouldGoNegative_ReturnsValidationFailureAndLeavesQuantityUnchanged()
    {
        var stockLevel = new StockLevelEntity(Guid.NewGuid(), Guid.NewGuid(), 10);
        _repository.Setup(r => r.GetByIdAsync(stockLevel.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stockLevel);

        var handler = new AdjustStockQuantityHandler(_repository.Object);
        var result = await handler.Handle(new AdjustStockQuantityCommand(stockLevel.Id, -20), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Validation);
        stockLevel.Quantity.Should().Be(10);
    }

    [Fact]
    public async Task Handle_StockLevelNotFound_ReturnsNotFound()
    {
        var missingId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockLevelEntity?)null);

        var handler = new AdjustStockQuantityHandler(_repository.Object);
        var result = await handler.Handle(new AdjustStockQuantityCommand(missingId, 10), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
    }
}
