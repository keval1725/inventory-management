using Inventory.Application.Common.Exceptions;
using Inventory.Application.Common.Interfaces;
using Inventory.Domain.Modules.Identity.Entities;
using Microsoft.EntityFrameworkCore;
using ProductEntity = Inventory.Domain.Modules.Product.Entities.Product;
using StockLevelEntity = Inventory.Domain.Modules.Stock.Entities.StockLevel;
using WarehouseEntity = Inventory.Domain.Modules.Warehouse.Entities.Warehouse;

namespace Inventory.Persistence;

public class InventoryDbContext : DbContext, IUnitOfWork
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options)
    {
    }

    public DbSet<WarehouseEntity> Warehouses => Set<WarehouseEntity>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<StockLevelEntity> StockLevels => Set<StockLevelEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InventoryDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new ConcurrencyConflictException(
                "The record was modified by another request. Reload and try again.", ex);
        }
    }
}
