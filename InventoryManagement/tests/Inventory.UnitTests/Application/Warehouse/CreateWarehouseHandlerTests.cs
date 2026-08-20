using FluentAssertions;
using Inventory.Application.Modules.Warehouse.Commands.CreateWarehouse;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Shared.Results;
using Moq;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Application.Warehouse;

public class CreateWarehouseHandlerTests
{
    private readonly Mock<IWarehouseRepository> _repository = new();

    [Fact]
    public async Task Handle_NameNotTaken_AddsWarehouseAndReturnsSuccess()
    {
        _repository.Setup(r => r.ExistsByNameAsync("Main DC", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new CreateWarehouseHandler(_repository.Object);
        var command = new CreateWarehouseCommand("Main DC", "123 Industrial Way");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _repository.Verify(
            r => r.AddAsync(It.Is<WarehouseEntity>(w => w.Name == "Main DC"), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_NameAlreadyExists_ReturnsConflictAndDoesNotAdd()
    {
        _repository.Setup(r => r.ExistsByNameAsync("Main DC", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new CreateWarehouseHandler(_repository.Object);
        var command = new CreateWarehouseCommand("Main DC", "123 Industrial Way");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Conflict);
        _repository.Verify(
            r => r.AddAsync(It.IsAny<WarehouseEntity>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
