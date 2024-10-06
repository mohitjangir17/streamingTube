// errorHandler.js
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Default to 500 if no specific status is provided

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',  // Main error message
        statusCode,
        errors: err.errors || [],  // Optional detailed error messages
        data: err.data || null     // Optional additional context for the error
    });
};

export { errorHandler };
