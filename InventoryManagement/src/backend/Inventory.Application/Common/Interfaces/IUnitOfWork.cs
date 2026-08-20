namespace Inventory.Application.Common.Interfaces;

/// <summary>
/// DbContext.SaveChangesAsync() is the unit of work — this interface exists
/// only so TransactionBehavior (Application layer) can call it without
/// depending on Persistence/EF Core directly.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
