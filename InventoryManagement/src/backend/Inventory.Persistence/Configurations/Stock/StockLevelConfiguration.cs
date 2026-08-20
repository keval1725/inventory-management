using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;

namespace Inventory.Persistence.Configurations.Stock;

public class StockLevelConfiguration : IEntityTypeConfiguration<StockLevelEntity>
{
    public void Configure(EntityTypeBuilder<StockLevelEntity> builder)
    {
        builder.ToTable("StockLevel", "stock");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.ProductId)
            .IsRequired();

        builder.Property(s => s.WarehouseId)
            .IsRequired();

        builder.Property(s => s.Quantity)
            .IsRequired();

        // One StockLevel row per product/warehouse pair.
        builder.HasIndex(s => new { s.ProductId, s.WarehouseId })
            .IsUnique();

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(s => s.UpdatedAt);

        builder.Property(s => s.UpdatedBy)
            .HasMaxLength(256);

        // Concurrent stock movements on the same row are exactly where this
        // domain's real bugs hide — RowVersion from day one, per
        // backend-architecture.md §6.
        builder.Property<byte[]>("RowVersion")
            .IsRowVersion();
    }
}
