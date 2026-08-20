using Inventory.Domain.Modules.Identity.Entities;

namespace Inventory.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
