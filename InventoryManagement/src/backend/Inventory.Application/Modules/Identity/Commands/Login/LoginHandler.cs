using Inventory.Application.Common.Interfaces;
using Inventory.Application.Modules.Identity.DTOs;
using Inventory.Application.Modules.Identity.Interfaces;
using Inventory.Shared.Results;
using MediatR;

namespace Inventory.Application.Modules.Identity.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, Result<LoginResponseDto>>
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Same generic failure for "no such user" and "wrong password" —
        // a distinct message for the first case would let a caller enumerate
        // valid emails by observing which error they get back.
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result.Failure<LoginResponseDto>(InvalidCredentialsMessage, ErrorCode.Unauthorized);
        }

        var token = _jwtTokenService.GenerateToken(user);
        var response = new LoginResponseDto(token, user.Id, user.Email, user.Role.ToString());

        return Result.Success(response);
    }
}
