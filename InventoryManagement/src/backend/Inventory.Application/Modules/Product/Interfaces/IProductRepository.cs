using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;

namespace Inventory.Application.Modules.Product.Interfaces;

public interface IProductRepository
{
    Task<ProductEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<(IReadOnlyList<ProductEntity> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CancellationToken cancellationToken);

    Task<bool> ExistsBySkuAsync(string sku, CancellationToken cancellationToken);

    Task AddAsync(ProductEntity product, CancellationToken cancellationToken);
}
