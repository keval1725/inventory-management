using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Inventory.Persistence;

/// <summary>
/// Design-time only — lets `dotnet ef migrations add` build the model without
/// depending on Inventory.API's DI wiring, which isn't in place until Task B6.
/// Runtime connection string configuration (appsettings/user secrets) is a
/// separate, later concern; this one is only ever used to scaffold migrations.
/// </summary>
public class InventoryDbContextFactory : IDesignTimeDbContextFactory<InventoryDbContext>
{
    private const string DesignTimeConnectionString =
        "Server=DESKTOP-4HN10C4;Database=InventoryManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

    public InventoryDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
        optionsBuilder.UseSqlServer(DesignTimeConnectionString);

        return new InventoryDbContext(optionsBuilder.Options);
    }
}
