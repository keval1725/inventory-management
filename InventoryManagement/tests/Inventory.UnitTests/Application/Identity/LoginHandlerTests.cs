using FluentAssertions;
using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Identity.Commands.Login;
using Inventory.Application.Modules.Identity.Interfaces;
using Inventory.Domain.Modules.Identity.Entities;
using Inventory.Shared.Results;
using Moq;

namespace Inventory.UnitTests.Application.Identity;

public class LoginHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IJwtTokenService> _jwtTokenService = new();

    private LoginHandler CreateHandler() =>
        new(_userRepository.Object, _passwordHasher.Object, _jwtTokenService.Object);

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsTokenAndUserInfo()
    {
        var user = new User("admin@inventory.local", "stored-hash", UserRole.Admin);
        _userRepository.Setup(r => r.GetByEmailAsync("admin@inventory.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("Admin123!", "stored-hash")).Returns(true);
        _jwtTokenService.Setup(j => j.GenerateToken(user)).Returns("fake-jwt-token");

        var result = await CreateHandler().Handle(
            new LoginCommand("admin@inventory.local", "Admin123!"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("fake-jwt-token");
        result.Value.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Handle_UnknownEmail_ReturnsUnauthorized()
    {
        _userRepository.Setup(r => r.GetByEmailAsync("nobody@inventory.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var result = await CreateHandler().Handle(
            new LoginCommand("nobody@inventory.local", "whatever"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Unauthorized);
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsUnauthorized()
    {
        var user = new User("admin@inventory.local", "stored-hash", UserRole.Admin);
        _userRepository.Setup(r => r.GetByEmailAsync("admin@inventory.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("WrongPassword", "stored-hash")).Returns(false);

        var result = await CreateHandler().Handle(
            new LoginCommand("admin@inventory.local", "WrongPassword"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Unauthorized);
    }

    [Fact]
    public async Task Handle_UnknownEmailAndWrongPassword_ReturnSameErrorMessage()
    {
        _userRepository.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        var unknownEmailResult = await CreateHandler().Handle(
            new LoginCommand("nobody@inventory.local", "whatever"), CancellationToken.None);

        var user = new User("admin@inventory.local", "stored-hash", UserRole.Admin);
        _userRepository.Setup(r => r.GetByEmailAsync("admin@inventory.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify(It.IsAny<string>(), "stored-hash")).Returns(false);
        var wrongPasswordResult = await CreateHandler().Handle(
            new LoginCommand("admin@inventory.local", "WrongPassword"), CancellationToken.None);

        unknownEmailResult.Error.Should().Be(wrongPasswordResult.Error);
    }
}
