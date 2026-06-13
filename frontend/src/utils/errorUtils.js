/**
 * Parses a FastAPI error response body into a human-readable string.
 *
 * FastAPI can return `detail` in two shapes:
 *  - Array  (422 Pydantic validation errors): [{ loc, msg, type }, ...]
 *  - String (custom HTTPException):           "Some error message"
 *
 * @param {Object|null} errorData - The parsed JSON body of a failed API response.
 * @returns {string} A user-friendly error message.
 */
export function parseApiError(errorData) {
  if (!errorData) return 'Something went wrong. Please try again.';

  const detail = errorData.detail;

  // FastAPI validation errors (422) — array of error objects
  if (Array.isArray(detail)) {
    const firstError = detail[0];
    if (!firstError) return 'Validation failed. Please check your input.';
    const field = firstError.loc?.[firstError.loc.length - 1] || 'field';
    return `${field}: ${firstError.msg}`;
  }

  // Simple string detail (most custom HTTPExceptions)
  if (typeof detail === 'string') {
    return detail;
  }

  return 'Something went wrong. Please try again.';
}
