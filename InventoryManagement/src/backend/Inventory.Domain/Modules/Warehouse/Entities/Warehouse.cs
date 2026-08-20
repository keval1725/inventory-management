using Inventory.Domain.Common;
using Inventory.Domain.Exceptions;

namespace Inventory.Domain.Modules.Warehouse.Entities;

public class Warehouse : BaseEntity, ISoftDeletable
{
    private const int MaxNameLength = 200;
    private const int MaxAddressLength = 500;

    public string Name { get; private set; } = string.Empty;
    public string Address { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    private Warehouse()
    {
    }

    public Warehouse(string name, string address)
    {
        Name = ValidateName(name);
        Address = ValidateAddress(address);
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    private static string ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Warehouse name is required.");
        }

        if (name.Length > MaxNameLength)
        {
            throw new DomainException($"Warehouse name cannot exceed {MaxNameLength} characters.");
        }

        return name;
    }

    private static string ValidateAddress(string address)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            throw new DomainException("Warehouse address is required.");
        }

        if (address.Length > MaxAddressLength)
        {
            throw new DomainException($"Warehouse address cannot exceed {MaxAddressLength} characters.");
        }

        return address;
    }
}
