using FluentAssertions;
using Inventory.Domain.Exceptions;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.UnitTests.Domain.Warehouse;

public class WarehouseTests
{
    [Fact]
    public void Constructor_ValidNameAndAddress_CreatesActiveWarehouseWithNewId()
    {
        var warehouse = new WarehouseEntity("Main DC", "123 Industrial Way");

        warehouse.Id.Should().NotBeEmpty();
        warehouse.Name.Should().Be("Main DC");
        warehouse.Address.Should().Be("123 Industrial Way");
        warehouse.IsActive.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_NameMissing_ThrowsDomainException(string? name)
    {
        var act = () => new WarehouseEntity(name!, "123 Industrial Way");

        act.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_AddressMissing_ThrowsDomainException(string? address)
    {
        var act = () => new WarehouseEntity("Main DC", address!);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_NameExceedsMaxLength_ThrowsDomainException()
    {
        var tooLongName = new string('A', 201);

        var act = () => new WarehouseEntity(tooLongName, "123 Industrial Way");

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_AddressExceedsMaxLength_ThrowsDomainException()
    {
        var tooLongAddress = new string('A', 501);

        var act = () => new WarehouseEntity("Main DC", tooLongAddress);

        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Deactivate_ActiveWarehouse_SetsIsActiveFalse()
    {
        var warehouse = new WarehouseEntity("Main DC", "123 Industrial Way");

        warehouse.Deactivate();

        warehouse.IsActive.Should().BeFalse();
    }
}
