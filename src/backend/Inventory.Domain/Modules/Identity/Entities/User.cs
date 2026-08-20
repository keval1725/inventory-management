using Inventory.Domain.Common;
using Inventory.Domain.Exceptions;

namespace Inventory.Domain.Modules.Identity.Entities;

public class User : BaseEntity
{
    private const int MaxEmailLength = 256;

    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }

    private User()
    {
    }

    public User(string email, string passwordHash, UserRole role)
    {
        Email = ValidateEmail(email);
        PasswordHash = ValidatePasswordHash(passwordHash);
        Role = role;
    }

    private static string ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new DomainException("A valid email is required.");
        }

        if (email.Length > MaxEmailLength)
        {
            throw new DomainException($"Email cannot exceed {MaxEmailLength} characters.");
        }

        return email;
    }

    private static string ValidatePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new DomainException("Password hash is required.");
        }

        return passwordHash;
    }
}
