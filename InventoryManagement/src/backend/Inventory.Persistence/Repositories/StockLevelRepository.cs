using Inventory.Application.Modules.Stock.Interfaces;
using Microsoft.EntityFrameworkCore;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;

namespace Inventory.Persistence.Repositories;

public class StockLevelRepository : IStockLevelRepository
{
    private readonly InventoryDbContext _context;

    public StockLevelRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Task<StockLevelEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _context.StockLevels.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public Task<StockLevelEntity?> GetByProductAndWarehouseAsync(
        Guid productId, Guid warehouseId, CancellationToken cancellationToken)
    {
        return _context.StockLevels.FirstOrDefaultAsync(
            s => s.ProductId == productId && s.WarehouseId == warehouseId, cancellationToken);
    }

    public async Task<(IReadOnlyList<StockLevelEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, Guid? warehouseId, Guid? productId, CancellationToken cancellationToken)
    {
        var query = _context.StockLevels.AsQueryable();

        if (warehouseId is not null)
        {
            query = query.Where(s => s.WarehouseId == warehouseId);
        }

        if (productId is not null)
        {
            query = query.Where(s => s.ProductId == productId);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(s => s.WarehouseId).ThenBy(s => s.ProductId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(StockLevelEntity stockLevel, CancellationToken cancellationToken)
    {
        await _context.StockLevels.AddAsync(stockLevel, cancellationToken);
    }
}
