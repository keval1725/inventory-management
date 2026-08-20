using Inventory.Domain.Modules.Identity.Entities;

namespace Inventory.Application.Modules.Identity.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
}
