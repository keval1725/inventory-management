using Inventory.Application.Common.Exceptions;
using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Common.Behaviors;

/// <summary>
/// Wraps commands (never queries) in a call to IUnitOfWork.SaveChangesAsync — the
/// single SaveChanges call per command IS the unit of work (see backend-architecture.md §7).
/// Only persists when the handler actually succeeded, so a business-rule failure
/// never leaves partial writes behind.
/// </summary>
public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICommand<TResponse>
    where TResponse : Result
{
    private readonly IUnitOfWork _unitOfWork;

    public TransactionBehavior(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var response = await next();

        if (!response.IsSuccess)
        {
            return response;
        }

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (ConcurrencyConflictException ex)
        {
            return Result.FailureAs<TResponse>(ex.Message, ErrorCode.Conflict);
        }

        return response;
    }
}
