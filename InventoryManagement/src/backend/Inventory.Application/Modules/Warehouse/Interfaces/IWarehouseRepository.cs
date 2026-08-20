using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.Application.Modules.Warehouse.Interfaces;

public interface IWarehouseRepository
{
    Task<WarehouseEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<(IReadOnlyList<WarehouseEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken);

    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken);

    Task AddAsync(WarehouseEntity warehouse, CancellationToken cancellationToken);
}
