namespace Inventory.Application.Common.Exceptions;

/// <summary>
/// Thrown by IUnitOfWork.SaveChangesAsync when a RowVersion mismatch is
/// detected — translated from EF Core's DbUpdateConcurrencyException at the
/// Persistence boundary so Application never references EF Core directly.
/// </summary>
public class ConcurrencyConflictException : Exception
{
    public ConcurrencyConflictException(string message) : base(message)
    {
    }

    public ConcurrencyConflictException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
