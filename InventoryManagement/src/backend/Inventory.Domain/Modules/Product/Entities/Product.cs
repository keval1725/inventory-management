using Inventory.Domain.Common;
using Inventory.Domain.Exceptions;

namespace Inventory.Domain.Modules.Product.Entities;

public class Product : BaseEntity, ISoftDeletable
{
    private const int MaxNameLength = 200;
    private const int MaxSkuLength = 50;
    private const int MaxCategoryLength = 100;

    public string Name { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public bool IsActive { get; private set; }

    private Product()
    {
    }

    public Product(string name, string sku, string? category)
    {
        Name = ValidateName(name);
        Sku = ValidateSku(sku);
        Category = ValidateCategory(category);
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
            throw new DomainException("Product name is required.");
        }

        if (name.Length > MaxNameLength)
        {
            throw new DomainException($"Product name cannot exceed {MaxNameLength} characters.");
        }

        return name;
    }

    private static string ValidateSku(string sku)
    {
        if (string.IsNullOrWhiteSpace(sku))
        {
            throw new DomainException("SKU is required.");
        }

        if (sku.Length > MaxSkuLength)
        {
            throw new DomainException($"SKU cannot exceed {MaxSkuLength} characters.");
        }

        return sku;
    }

    private static string? ValidateCategory(string? category)
    {
        if (category is not null && category.Length > MaxCategoryLength)
        {
            throw new DomainException($"Category cannot exceed {MaxCategoryLength} characters.");
        }

        return category;
    }
}
