class ApiResponse {
    constructor(
        statusCode, data, message = 'Success'
    ) {
        this.statusCode = statusCode,
            // this.data = data ? JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'object' && value !== null ? value.toJSON(x) : value)) : null;
            this.data = data,
            this.message = message,
            this.success = statusCode < 400
    }
}

export { ApiResponse };