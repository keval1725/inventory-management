using FluentAssertions;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Application.Modules.Warehouse.Queries.GetWarehouses;
using Moq;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Application.Warehouse;

public class GetWarehousesHandlerTests
{
    private readonly Mock<IWarehouseRepository> _repository = new();

    [Fact]
    public async Task Handle_ReturnsPagedResultMappedFromRepository()
    {
        var warehouses = new List<WarehouseEntity>
        {
            new("Main DC", "123 Industrial Way"),
            new("North DC", "456 Storage Ave"),
        };
        _repository.Setup(r => r.GetPagedAsync(1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync((warehouses, 2));

        var handler = new GetWarehousesHandler(_repository.Object);
        var result = await handler.Handle(new GetWarehousesQuery(1, 20), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.TotalCount.Should().Be(2);
        result.Value.Items.Should().HaveCount(2);
        result.Value.Page.Should().Be(1);
        result.Value.PageSize.Should().Be(20);
    }
}
