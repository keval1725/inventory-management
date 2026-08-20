using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Identity.Interfaces;
using Inventory.Application.Modules.Product.Interfaces;
using Inventory.Application.Modules.Stock.Interfaces;
using Inventory.Application.Modules.Warehouse.Interfaces;
using Inventory.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Inventory.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<InventoryDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<InventoryDbContext>());

        services.AddScoped<IWarehouseRepository, WarehouseRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IStockLevelRepository, StockLevelRepository>();

        return services;
    }
}
