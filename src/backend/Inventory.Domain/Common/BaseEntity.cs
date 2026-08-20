namespace Inventory.Domain.Common;

public abstract class BaseEntity : IAuditable
{
    public Guid Id { get; protected init; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
    }
}
