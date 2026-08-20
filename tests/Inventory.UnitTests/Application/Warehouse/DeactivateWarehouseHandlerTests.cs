using FluentAssertions;
using Inventory.Application.Modules.Warehouse.Commands.DeactivateWarehouse;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using Moq;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Application.Warehouse;

public class DeactivateWarehouseHandlerTests
{
    private readonly Mock<IWarehouseRepository> _repository = new();

    [Fact]
    public async Task Handle_WarehouseExists_DeactivatesAndReturnsSuccess()
    {
        var warehouse = new WarehouseEntity("Main DC", "123 Industrial Way");
        _repository.Setup(r => r.GetByIdAsync(warehouse.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(warehouse);

        var handler = new DeactivateWarehouseHandler(_repository.Object);
        var result = await handler.Handle(new DeactivateWarehouseCommand(warehouse.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        warehouse.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WarehouseDoesNotExist_ReturnsNotFound()
    {
        var missingId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((WarehouseEntity?)null);

        var handler = new DeactivateWarehouseHandler(_repository.Object);
        var result = await handler.Handle(new DeactivateWarehouseCommand(missingId), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
    }
}
