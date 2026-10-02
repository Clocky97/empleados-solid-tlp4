import { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';

export class ErrorHandler {
  public handle: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }

    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  };
}
