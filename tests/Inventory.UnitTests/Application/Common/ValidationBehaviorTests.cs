using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Inventory.Application.Common.Behaviors;
using Inventory.Shared.Results;
using Moq;

namespace Inventory.UnitTests.Application.Common;

public class ValidationBehaviorTests
{
    public record SampleRequest(string Name);

    [Fact]
    public async Task Handle_NoValidators_CallsNext()
    {
        var behavior = new ValidationBehavior<SampleRequest, Result<int>>(
            Enumerable.Empty<IValidator<SampleRequest>>());

        var result = await behavior.Handle(
            new SampleRequest("ok"), _ => Task.FromResult(Result.Success(42)), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(42);
    }

    [Fact]
    public async Task Handle_ValidatorFails_ReturnsValidationFailureWithoutCallingNext()
    {
        var validator = new Mock<IValidator<SampleRequest>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<SampleRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Name", "Name is required.") }));

        var behavior = new ValidationBehavior<SampleRequest, Result<int>>(new[] { validator.Object });
        var nextCalled = false;

        var result = await behavior.Handle(
            new SampleRequest(""),
            _ => { nextCalled = true; return Task.FromResult(Result.Success(42)); },
            CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Validation);
        result.Error.Should().Contain("Name is required.");
        nextCalled.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_ValidatorFails_NonGenericResult_ReturnsValidationFailure()
    {
        var validator = new Mock<IValidator<SampleRequest>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<SampleRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Name", "Name is required.") }));

        var behavior = new ValidationBehavior<SampleRequest, Result>(new[] { validator.Object });

        var result = await behavior.Handle(
            new SampleRequest(""), _ => Task.FromResult(Result.Success()), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be(ErrorCode.Validation);
    }
}
