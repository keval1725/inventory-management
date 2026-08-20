using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Common.Interfaces;

/// <summary>Marks a request as read-only — never wrapped by TransactionBehavior.</summary>
public interface IQuery<TResponse> : IRequest<TResponse> where TResponse : Result
{
}
