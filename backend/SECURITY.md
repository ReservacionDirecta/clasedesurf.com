# Security Configuration

## Cookie Security

The application uses secure HTTP-only cookies for refresh tokens with the following configuration:

### Production Settings
- `httpOnly: true` - Prevents JavaScript access to cookies (XSS protection)
- `secure: true` - Cookies only sent over HTTPS
- `sameSite: 'strict'` - Prevents CSRF attacks by not sending cookies on cross-site requests
- `maxAge: 30 days` - Automatic expiration

### Development Settings
- `httpOnly: true` - Always enabled
- `secure: false` - Allows HTTP in development
- `sameSite: 'strict'` - Always enabled
- `maxAge: 30 days` - Automatic expiration

The security level is automatically determined by the `NODE_ENV` environment variable.

## Rate Limiting

Rate limiting is implemented to prevent brute force attacks and abuse:

### Authentication Endpoints (`/auth/login`, `/auth/register`)
- **Limit**: 5 requests per 15 minutes per IP address
- **Purpose**: Prevent brute force attacks on authentication
- **Response**: HTTP 429 with Spanish error message

### General API Endpoints
- **Limit**: 100 requests per 15 minutes per IP address
- **Purpose**: Prevent API abuse
- **Response**: HTTP 429 with Spanish error message

### Development Mode
Rate limiting can be disabled in development by setting:
```
SKIP_RATE_LIMIT=true
```

## CORS Configuration

CORS is configured to support credentials (cookies) with:
- `origin`: Configured via `FRONTEND_URL` environment variable
- `credentials: true` - Allows cookies to be sent cross-origin
- Default origin: `http://localhost:3000` (development)

## Environment Variables

Required for security features:
- `NODE_ENV`: Set to `production` for secure cookies
- `FRONTEND_URL`: Frontend URL for CORS configuration
- `JWT_SECRET`: Secret key for JWT token signing

Optional:
- `SKIP_RATE_LIMIT`: Set to `true` to disable rate limiting in development

## Best Practices

1. **Always use HTTPS in production** - The `secure` cookie flag requires HTTPS
2. **Set strong JWT_SECRET** - Use a long, random string
3. **Configure FRONTEND_URL** - Set to your actual frontend domain in production
4. **Monitor rate limit hits** - Check logs for potential attacks
5. **Rotate JWT secrets periodically** - Update JWT_SECRET in production environments

## Testing Security Features

### Test Rate Limiting
```bash
# Make 6 rapid requests to trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Test Cookie Security
Check response headers for:
- `Set-Cookie` header with `HttpOnly`, `Secure` (in production), and `SameSite=Strict`

### Test CORS
```bash
# Should succeed from configured origin
curl -X POST http://localhost:4000/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Should fail from different origin
curl -X POST http://localhost:4000/auth/login \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```
