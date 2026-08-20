namespace Inventory.Shared.Results;

/// <summary>Maps to an HTTP status code in the API layer's ProblemDetails mapping.</summary>
public enum ErrorCode
{
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
    Forbidden,
    Unexpected,
}
