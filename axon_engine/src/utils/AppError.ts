class AppError extends Error {
  statusCode: number;
  errors: unknown;

  constructor(statusCode: number, message: string, errors: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export default AppError;
