using Inventory.Domain.Common;
using Inventory.Domain.Exceptions;

namespace Inventory.Domain.Modules.Stock.Entities;

// ProductId/WarehouseId are plain FKs on purpose — no EF navigation property
// into Product or Warehouse. Cross-module reads go through a query, never a
// joined navigation (backend-architecture.md §3) — this is what keeps the
// eventual Phase 8 service split a move, not a rewrite.
public class StockLevel : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid WarehouseId { get; private set; }
    public int Quantity { get; private set; }

    private StockLevel()
    {
    }

    public StockLevel(Guid productId, Guid warehouseId, int initialQuantity)
    {
        if (productId == Guid.Empty)
        {
            throw new DomainException("ProductId is required.");
        }

        if (warehouseId == Guid.Empty)
        {
            throw new DomainException("WarehouseId is required.");
        }

        if (initialQuantity < 0)
        {
            throw new DomainException("Initial quantity cannot be negative.");
        }

        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = initialQuantity;
    }

    public void AdjustQuantity(int delta)
    {
        var newQuantity = Quantity + delta;
        if (newQuantity < 0)
        {
            throw new DomainException(
                $"Cannot adjust quantity by {delta}: current quantity is {Quantity}, result would be negative.");
        }

        Quantity = newQuantity;
    }
}
