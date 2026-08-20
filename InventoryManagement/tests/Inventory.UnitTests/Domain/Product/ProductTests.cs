using FluentAssertions;
using Inventory.Domain.Exceptions;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.UnitTests.Domain.Product;

public class ProductTests
{
    [Fact]
    public void Constructor_ValidNameAndSku_CreatesActiveProduct()
    {
        var product = new ProductEntity("Widget", "SKU-001", "Hardware");

        product.Id.Should().NotBeEmpty();
        product.Name.Should().Be("Widget");
        product.Sku.Should().Be("SKU-001");
        product.Category.Should().Be("Hardware");
        product.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Constructor_CategoryNull_IsAllowed()
    {
        var product = new ProductEntity("Widget", "SKU-001", null);

        product.Category.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_NameMissing_ThrowsDomainException(string? name)
    {
        var act = () => new ProductEntity(name!, "SKU-001", null);

        act.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_SkuMissing_ThrowsDomainException(string? sku)
    {
        var act = () => new ProductEntity("Widget", sku!, null);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Deactivate_ActiveProduct_SetsIsActiveFalse()
    {
        var product = new ProductEntity("Widget", "SKU-001", null);

        product.Deactivate();

        product.IsActive.Should().BeFalse();
    }
}
