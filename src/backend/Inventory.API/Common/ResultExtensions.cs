using Inventory.Shared.Results;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Common;

/// <summary>Maps expected-failure Result/Result&lt;T&gt; outcomes to the same RFC 7807 ProblemDetails shape as the exception middleware.</summary>
public static class ResultExtensions
{
    public static ActionResult ToActionResult(this Result result)
    {
        return result.IsSuccess ? new NoContentResult() : ProblemFromResult(result);
    }

    public static ActionResult<T> ToActionResult<T>(this Result<T> result)
    {
        return result.IsSuccess ? new OkObjectResult(result.Value) : ProblemFromResult(result);
    }

    private static ObjectResult ProblemFromResult(Result result)
    {
        var statusCode = result.ErrorCode switch
        {
            ErrorCode.Validation => StatusCodes.Status400BadRequest,
            ErrorCode.NotFound => StatusCodes.Status404NotFound,
            ErrorCode.Conflict => StatusCodes.Status409Conflict,
            ErrorCode.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorCode.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError,
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = result.ErrorCode?.ToString() ?? "Unexpected error",
            Detail = result.Error,
        };

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }
}
