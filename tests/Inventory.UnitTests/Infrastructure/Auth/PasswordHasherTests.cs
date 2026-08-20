using FluentAssertions;
using Inventory.Infrastructure.Auth;

namespace Inventory.UnitTests.Infrastructure.Auth;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _hasher.Hash("Admin123!");

        _hasher.Verify("Admin123!", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _hasher.Hash("Admin123!");

        _hasher.Verify("WrongPassword!", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_SamePasswordTwice_ProducesDifferentHashes()
    {
        var hash1 = _hasher.Hash("Admin123!");
        var hash2 = _hasher.Hash("Admin123!");

        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void Verify_MalformedHash_ReturnsFalseInsteadOfThrowing()
    {
        _hasher.Verify("Admin123!", "not-a-valid-hash").Should().BeFalse();
    }
}
