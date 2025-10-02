"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
// Validation middleware factory
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
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
        }
        catch (error) {
            console.error('Validation middleware error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
exports.validateBody = validateBody;
// Validation middleware for URL parameters
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Invalid parameters',
                    errors
                });
            }
            // Replace req.params with validated and transformed data
            req.params = result.data;
            next();
        }
        catch (error) {
            console.error('Parameter validation middleware error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
exports.validateParams = validateParams;
// Validation middleware for query parameters
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    errors
                });
            }
            // Replace req.query with validated and transformed data
            req.query = result.data;
            next();
        }
        catch (error) {
            console.error('Query validation middleware error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
exports.validateQuery = validateQuery;
