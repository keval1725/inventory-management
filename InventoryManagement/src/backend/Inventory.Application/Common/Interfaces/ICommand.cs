using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Common.Interfaces;

/// <summary>Marks a request as a mutation — TransactionBehavior wraps these, never queries.</summary>
public interface ICommand<TResponse> : IRequest<TResponse> where TResponse : Result
{
}
