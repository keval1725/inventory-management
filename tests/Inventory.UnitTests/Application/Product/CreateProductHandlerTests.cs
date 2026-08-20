using FluentAssertions;
using Inventory.Application.Modules.Product.Commands.CreateProduct;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Shared.Results;
using Moq;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.UnitTests.Application.Product;

public class CreateProductHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();

    [Fact]
    public async Task Handle_SkuNotTaken_AddsProductAndReturnsSuccess()
    {
        _repository.Setup(r => r.ExistsBySkuAsync("SKU-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new CreateProductHandler(_repository.Object);
        var result = await handler.Handle(
            new CreateProductCommand("Widget", "SKU-001", "Hardware"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _repository.Verify(
            r => r.AddAsync(It.Is<ProductEntity>(p => p.Sku == "SKU-001"), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_SkuAlreadyExists_ReturnsConflictAndDoesNotAdd()
    {
        _repository.Setup(r => r.ExistsBySkuAsync("SKU-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new CreateProductHandler(_repository.Object);
        var result = await handler.Handle(
            new CreateProductCommand("Widget", "SKU-001", "Hardware"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Conflict);
        _repository.Verify(
            r => r.AddAsync(It.IsAny<ProductEntity>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
