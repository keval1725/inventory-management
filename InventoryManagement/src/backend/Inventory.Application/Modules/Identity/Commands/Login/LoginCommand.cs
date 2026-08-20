using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Identity.DTOs;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Identity.Commands.Login;

public record LoginCommand(string Email, string Password) : ICommand<Result<LoginResponseDto>>;
