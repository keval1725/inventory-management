using FluentAssertions;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Application.Modules.Warehouse.Queries.GetWarehouseById;
using Inventory.Shared.Results;
using Moq;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Application.Warehouse;

public class GetWarehouseByIdHandlerTests
{
    private readonly Mock<IWarehouseRepository> _repository = new();

    [Fact]
    public async Task Handle_WarehouseExists_ReturnsMappedDto()
    {
        var warehouse = new WarehouseEntity("Main DC", "123 Industrial Way");
        _repository.Setup(r => r.GetByIdAsync(warehouse.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(warehouse);

        var handler = new GetWarehouseByIdHandler(_repository.Object);
        var result = await handler.Handle(new GetWarehouseByIdQuery(warehouse.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().Be(warehouse.Id);
        result.Value.Name.Should().Be("Main DC");
    }

    [Fact]
    public async Task Handle_WarehouseDoesNotExist_ReturnsNotFound()
    {
        var missingId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((WarehouseEntity?)null);

        var handler = new GetWarehouseByIdHandler(_repository.Object);
        var result = await handler.Handle(new GetWarehouseByIdQuery(missingId), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
    }
}
