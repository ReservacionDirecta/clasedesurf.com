import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log incoming body for debugging (truncate large fields like profilePhoto)
      const logBody = { ...req.body };
      if (logBody.profilePhoto && typeof logBody.profilePhoto === 'string') {
        logBody.profilePhoto = `[base64 string, ${logBody.profilePhoto.length} chars]`;
      }
      console.log('[Validation] Validating body:', JSON.stringify(logBody, null, 2));
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        console.error('[Validation] Validation failed:', errors);
        return res.status(400).json({
          message: 'Validation error',
          errors
        });
      }
      
      // Log validated data (truncate large fields)
      const validatedData = result.data as Record<string, any>;
      const logValidated: Record<string, any> = { ...validatedData };
      if (logValidated.profilePhoto && typeof logValidated.profilePhoto === 'string') {
        logValidated.profilePhoto = `[base64 string, ${logValidated.profilePhoto.length} chars]`;
      }
      console.log('[Validation] Validation passed:', JSON.stringify(logValidated, null, 2));
      console.log('[Validation] foundedYear in validated data:', logValidated.foundedYear, typeof logValidated.foundedYear);
      
      // Replace req.body with validated and transformed data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('[Validation] Validation middleware error:', error);
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