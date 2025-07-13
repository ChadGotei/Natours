import AppError from "../utils/appError.js";

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProduction = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status || 'error',
            message: err.message,
        })
    } else {
        // Programming errors
        console.error('ERROR', err);

        res.status(500).json({
            status: "error",
            message: "Something went wrong",
        })
    }
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateField = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)
    const message = `Duplicate Field value: ${value}`

    return new AppError(message, 400);
}

const handleValidationError = err => {
    const errors = Object.values(err.errors).map(ele => ele.message);

    const message = `Invalid Input Data: ${errors.join('.')}`;
    return new AppError(message, 400);
}

const handleJsonError = () => new AppError("Invalid token. Please login again!", 401);


// using session instead of token since its production error and we are going to be sending it to the user rather than the developer
const handleTokenExpiration = () => new AppError("Session expired! Please login again", 401);

export default (err, _, res, next) => {
    // console.log(err.stack);
    const NODE_ENV = process.env.NODE_ENV
    err.statusCode = err.statusCode || 500;

    if (NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (NODE_ENV === 'production') {
        let error = Object.create(err);

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateField(error);
        if (error.name === "ValidationError") error = handleValidationError(error);
        if (error.name === "JsonWebTokenError") error = handleJsonError();
        if (error.name === "TokenExpiredError") error = handleTokenExpiration();

        sendErrorProduction(error, res);
    }

    next();
}