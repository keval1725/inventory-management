namespace Inventory.Shared.Results;

/// <summary>
/// Expected-failure result for command/query handlers — validation, not-found,
/// business rule violations. Handlers return this instead of throwing;
/// exceptions stay reserved for truly unexpected failures.
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public ErrorCode? ErrorCode { get; }

    protected Result(bool isSuccess, string? error, ErrorCode? errorCode)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
    }

    public static Result Success() => new(true, null, null);

    public static Result Failure(string error, ErrorCode errorCode) => new(false, error, errorCode);

    public static Result<T> Success<T>(T value) => Result<T>.Success(value);

    public static Result<T> Failure<T>(string error, ErrorCode errorCode) => Result<T>.Failure(error, errorCode);

    /// <summary>
    /// Builds a failure of whichever concrete Result type TResponse is —
    /// Result or Result&lt;T&gt; — without the caller knowing which at compile
    /// time. Used by pipeline behaviors, which are generic over TResponse.
    /// </summary>
    public static TResponse FailureAs<TResponse>(string error, ErrorCode errorCode) where TResponse : Result
    {
        if (typeof(TResponse) == typeof(Result))
        {
            return (TResponse)(object)Failure(error, errorCode);
        }

        var valueType = typeof(TResponse).GetGenericArguments()[0];
        var failureMethod = typeof(Result)
            .GetMethods()
            .First(m => m.Name == nameof(Failure) && m.IsGenericMethodDefinition)
            .MakeGenericMethod(valueType);

        return (TResponse)failureMethod.Invoke(null, new object[] { error, errorCode })!;
    }
}

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(bool isSuccess, T? value, string? error, ErrorCode? errorCode)
        : base(isSuccess, error, errorCode)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, value, null, null);

    public new static Result<T> Failure(string error, ErrorCode errorCode) => new(false, default, error, errorCode);
}
