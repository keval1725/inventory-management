using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;

namespace Inventory.Application.Modules.Stock.Interfaces;

public interface IStockLevelRepository
{
    Task<StockLevelEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<StockLevelEntity?> GetByProductAndWarehouseAsync(
        Guid productId, Guid warehouseId, CancellationToken cancellationToken);

    Task<(IReadOnlyList<StockLevelEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, Guid? warehouseId, Guid? productId, CancellationToken cancellationToken);

    Task AddAsync(StockLevelEntity stockLevel, CancellationToken cancellationToken);
}
