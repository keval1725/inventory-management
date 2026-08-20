namespace Inventory.Domain.Common;

public interface ISoftDeletable
{
    bool IsActive { get; }
}
