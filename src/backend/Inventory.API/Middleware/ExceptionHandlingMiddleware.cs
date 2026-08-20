using Inventory.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Middleware;

/// <summary>
/// Catches anything unhandled and returns RFC 7807 ProblemDetails, so every
/// error response — this one included — has the same shape. Result&lt;T&gt;
/// failures never reach here; they're mapped to ProblemDetails directly in
/// the controller (see ResultExtensions), since they're expected outcomes,
/// not exceptions.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain invariant violated");
            await WriteProblemDetailsAsync(context, StatusCodes.Status400BadRequest, "Invalid request", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteProblemDetailsAsync(
                context, StatusCodes.Status500InternalServerError, "An unexpected error occurred", ex.Message);
        }
    }

    private static async Task WriteProblemDetailsAsync(
        HttpContext context, int statusCode, string title, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
