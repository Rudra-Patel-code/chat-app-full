class ApiError extends Error {
  constructor(statusCode, message = "Somthing went Wrong", stack = "") {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export { ApiError };
