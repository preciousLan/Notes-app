class AppError extends Error {
  constructor(message, statusCode) {
    super(message);            // set the error message
    this.statusCode = statusCode; // attach HTTP status code
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // client vs server
    this.isOperational = true; // marks it as a “trusted” error

    Error.captureStackTrace(this, this.constructor); // clean stack trace
  }
}

module.exports = AppError;
