using Inventory.Application.Modules.Identity.Interfaces;
using Inventory.Domain.Modules.Identity.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly InventoryDbContext _context;

    public UserRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
}
