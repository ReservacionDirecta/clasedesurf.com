import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: 'Validation error',
          errors
        });
      }
      
      // Replace req.body with validated and transformed data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Validation middleware for URL parameters
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: 'Invalid parameters',
          errors
        });
      }
      
      // Replace req.params with validated and transformed data
      req.params = result.data as any;
      next();
    } catch (error) {
      console.error('Parameter validation middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Validation middleware for query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors
        });
      }
      
      // Replace req.query with validated and transformed data
      req.query = result.data as any;
      next();
    } catch (error) {
      console.error('Query validation middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};