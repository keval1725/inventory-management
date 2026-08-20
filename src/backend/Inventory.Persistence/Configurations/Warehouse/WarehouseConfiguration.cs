using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.Persistence.Configurations.Warehouse;

public class WarehouseConfiguration : IEntityTypeConfiguration<WarehouseEntity>
{
    public void Configure(EntityTypeBuilder<WarehouseEntity> builder)
    {
        builder.ToTable("Warehouse", "warehouse");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Id)
            .ValueGeneratedNever();

        builder.Property(w => w.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(w => w.Address)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(w => w.IsActive)
            .IsRequired();

        builder.Property(w => w.CreatedAt)
            .IsRequired();

        builder.Property(w => w.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(w => w.UpdatedAt);

        builder.Property(w => w.UpdatedBy)
            .HasMaxLength(256);

        // Soft delete: inactive warehouses are excluded from every query by
        // default. Callers that genuinely need inactive records (e.g. an
        // admin "show deactivated" view) use IgnoreQueryFilters() explicitly.
        builder.HasQueryFilter(w => w.IsActive);
    }
}
