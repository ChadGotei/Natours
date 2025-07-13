import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoute from './routes/user.routes.js';
import tourRoute from './routes/tour.routes.js';
import authRoute from './routes/auth.routes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errors.controller.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from "xss-clean";
import hpp from 'hpp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//* MIDDLEWARES
// Set security HTTP header
app.use(helmet());

// body parser, reading data etc
app.use(express.json({ limit: '10kb' }));   // body larger than 10kb wont be accepted

// data sanitization against nosql injects
app.use(mongoSanitize());
app.use(xss());   // to protect against cross side scripting

// prevent parameter pollution
app.use(hpp());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// logging in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"));
}

// Limits per ip
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,  // 100 requests per hour
    message: 'Too many requests! Please try again'
})

app.use('/api', limiter);    // applies to /api

//* ROUTES
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

//* Error handling middleware
app.use(globalErrorHandler);

export default app;
