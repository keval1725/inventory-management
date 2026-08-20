using Inventory.Application.Modules.Warehouse.Interfaces;
using Microsoft.EntityFrameworkCore;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.Persistence.Repositories;

public class WarehouseRepository : IWarehouseRepository
{
    private readonly InventoryDbContext _context;

    public WarehouseRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Task<WarehouseEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<WarehouseEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = _context.Warehouses.OrderBy(w => w.Name);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken)
    {
        return _context.Warehouses.AnyAsync(w => w.Name == name, cancellationToken);
    }

    public async Task AddAsync(WarehouseEntity warehouse, CancellationToken cancellationToken)
    {
        await _context.Warehouses.AddAsync(warehouse, cancellationToken);
    }
}
