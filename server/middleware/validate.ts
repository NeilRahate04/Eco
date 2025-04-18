import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Middleware that runs validation chains from express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map(error => ({
      path: error.path,
      message: error.msg
    }));

    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: formattedErrors 
    });
  };
};

/**
 * Middleware that validates request body against a Zod schema
 */
export const validateSchema = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: validationError.message 
        });
      }
      next(error);
    }
  };
};