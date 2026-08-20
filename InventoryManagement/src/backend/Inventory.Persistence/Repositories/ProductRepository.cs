using Inventory.Application.Modules.Product.Interfaces;
using Microsoft.EntityFrameworkCore;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly InventoryDbContext _context;

    public ProductRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Task<ProductEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<ProductEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = _context.Products.OrderBy(p => p.Name);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<bool> ExistsBySkuAsync(string sku, CancellationToken cancellationToken)
    {
        return _context.Products.AnyAsync(p => p.Sku == sku, cancellationToken);
    }

    public async Task AddAsync(ProductEntity product, CancellationToken cancellationToken)
    {
        await _context.Products.AddAsync(product, cancellationToken);
    }
}
