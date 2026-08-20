namespace Inventory.Application.Modules.Identity.DTOs;

public record LoginResponseDto(string Token, Guid UserId, string Email, string Role);
