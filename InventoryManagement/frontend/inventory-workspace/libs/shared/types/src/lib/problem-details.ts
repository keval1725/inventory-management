// Matches the backend's RFC 7807 ProblemDetails shape (Inventory.API.Common.ResultExtensions /
// ExceptionHandlingMiddleware) — every error response, success or failure path, has this shape.
export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}
