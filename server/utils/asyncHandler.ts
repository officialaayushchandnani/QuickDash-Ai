import { Request, Response, NextFunction } from 'express';

/**
 * A higher-order function that wraps async Express route handlers.
 * It catches any errors that occur within the async function and passes
 * them to Express's next() middleware, which will be caught by our
 * centralized error handler in server/index.ts.
 * * This avoids the need to write a repetitive try-catch block in every
 * single controller function.
 * * @param {(req: Request, res: Response, next: NextFunction) => Promise<any>} fn 
 * @returns A standard Express request handler.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;