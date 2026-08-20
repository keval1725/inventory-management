using FluentAssertions;
using Inventory.Application.Common.Behaviors;
using Inventory.Application.Common.Exceptions;
using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;
using MediatR;
using Moq;

namespace Inventory.UnitTests.Application.Common;

public class TransactionBehaviorTests
{
    public record SampleCommand : ICommand<Result<int>>;

    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private TransactionBehavior<SampleCommand, Result<int>> CreateBehavior() => new(_unitOfWork.Object);

    [Fact]
    public async Task Handle_HandlerSucceeds_CommitsAndReturnsSuccess()
    {
        var behavior = CreateBehavior();

        var result = await behavior.Handle(
            new SampleCommand(), _ => Task.FromResult(Result.Success(42)), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(42);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_HandlerFails_NeverCallsSaveChanges()
    {
        var behavior = CreateBehavior();

        await behavior.Handle(
            new SampleCommand(),
            _ => Task.FromResult(Result.Failure<int>("business rule violated", ErrorCode.Conflict)),
            CancellationToken.None);

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SaveChangesThrowsConcurrencyConflict_ReturnsConflictResultInsteadOfThrowing()
    {
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConcurrencyConflictException("row changed"));
        var behavior = CreateBehavior();

        var result = await behavior.Handle(
            new SampleCommand(), _ => Task.FromResult(Result.Success(42)), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Conflict);
    }
}
