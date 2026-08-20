using FluentAssertions;
using Inventory.Application.Modules.Product.Commands.DeactivateProduct;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using Moq;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.UnitTests.Application.Product;

public class DeactivateProductHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();

    [Fact]
    public async Task Handle_ProductExists_DeactivatesAndReturnsSuccess()
    {
        var product = new ProductEntity("Widget", "SKU-001", null);
        _repository.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var handler = new DeactivateProductHandler(_repository.Object);
        var result = await handler.Handle(new DeactivateProductCommand(product.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        product.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ProductDoesNotExist_ReturnsNotFound()
    {
        var missingId = Guid.NewGuid();
        _repository.Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductEntity?)null);

        var handler = new DeactivateProductHandler(_repository.Object);
        var result = await handler.Handle(new DeactivateProductCommand(missingId), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.NotFound);
    }
}
