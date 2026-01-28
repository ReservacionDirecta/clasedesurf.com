# PRD - Backend (clasedesurf.com)

## Product Overview
**Name:** Clase de Surf - Backend API  
**Version:** 0.1.0  
**Type:** Express.js REST API  
**Port:** 4000 (default)  
**Base URL:** https://api.clasedesurf.com (production)

## Tech Stack
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email Service:** Resend
- **Cache:** Redis
- **File Storage:** Cloudinary / Local Volume

## Core Features

### 1. Authentication System (`/auth`)
- **Login:** `POST /auth/login` - Email/password authentication, returns JWT
- **Register:** `POST /auth/register` - Create new user account
- **Google OAuth:** `POST /auth/google` - Social login
- **Refresh Token:** `POST /auth/refresh` - Rotate JWT tokens
- **Password Reset:** `POST /auth/forgot-password`, `POST /auth/reset-password`

### 2. Class Management (`/classes`)
- **List Classes:** `GET /classes` - Get all classes with filters
- **Get Class:** `GET /classes/:id` - Get single class details
- **Create Class:** `POST /classes` - Create new class (SCHOOL_ADMIN, INSTRUCTOR)
- **Update Class:** `PUT /classes/:id` - Update class details
- **Delete Class:** `DELETE /classes/:id` - Soft delete class

### 3. Reservation System (`/reservations`)
- **Create Reservation:** `POST /reservations` - Create booking (supports guest checkout)
- **List Reservations:** `GET /reservations` - Get user's reservations
- **Get Reservation:** `GET /reservations/:id` - Get single reservation
- **Update Reservation:** `PUT /reservations/:id` - Update/cancel reservation
- **Guest Checkout:** Creates user account if not authenticated

### 4. Guest Checkout Feature
- **Optional Auth Middleware:** Allows unauthenticated requests
- **Auto User Creation:** Creates new user with generated password
- **Email Validation:** Checks if email already exists
- **Auto Login Token:** Returns JWT for automatic frontend login
- **Welcome Email:** Sends credentials to new guest users

### 5. Payment System (`/payments`)
- **List Payments:** `GET /payments` - Get payments for reservation
- **Upload Voucher:** `POST /payments/:id/voucher` - Upload payment proof
- **Verify Payment:** `PUT /payments/:id` - Admin verification
- **Discount Codes:** Apply promotional discounts

### 6. School Management (`/schools`)
- **List Schools:** `GET /schools` - Get all schools
- **Get School:** `GET /schools/:id` - Get school details
- **Create School:** `POST /schools` - Create new school
- **Update School:** `PUT /schools/:id` - Update school info

### 7. Instructor Management (`/instructors`)
- **List Instructors:** `GET /instructors` - Get all instructors
- **Get Instructor:** `GET /instructors/:id` - Get instructor details
- **Create Instructor:** `POST /instructors` - Add instructor to school
- **Update Instructor:** `PUT /instructors/:id` - Update instructor info

### 8. User Management (`/users`)
- **Get Profile:** `GET /users/me` - Current user profile
- **Update Profile:** `PUT /users/me` - Update current user
- **Admin User List:** `GET /users` - List all users (admin only)

### 9. Email Service
- **Welcome Email:** Sends account credentials to new users
- **Reservation Confirmed:** Booking confirmation
- **Reservation Cancelled:** Cancellation notification
- **Payment Confirmed:** Payment receipt
- **Check-in Reminder:** Day-before reminder

### 10. Notification System (`/notifications`)
- **Get Notifications:** `GET /notifications` - User notifications
- **Mark Read:** `PUT /notifications/:id/read` - Mark as read
- **Mark All Read:** `PUT /notifications/read-all` - Mark all read

## API Routes Summary

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/auth/login` | POST | No | User login |
| `/auth/register` | POST | No | User registration |
| `/auth/refresh` | POST | No | Refresh JWT token |
| `/classes` | GET | No | List all classes |
| `/classes/:id` | GET | No | Get class details |
| `/classes` | POST | Yes | Create class |
| `/reservations` | POST | Optional | Create reservation (guest checkout) |
| `/reservations` | GET | Yes | Get user reservations |
| `/reservations/:id` | GET | Yes | Get reservation details |
| `/reservations/:id` | PUT | Yes | Update/cancel reservation |
| `/payments/:id/voucher` | POST | Yes | Upload payment voucher |
| `/schools` | GET | No | List schools |
| `/instructors` | GET | No | List instructors |

## Test Scenarios (Backend)

### Guest Checkout API Test
```bash
# Create reservation without authentication
curl -X POST http://localhost:4000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 3,
    "sessionId": "v_2026-01-28_09:00",
    "date": "2026-01-28",
    "time": "09:00",
    "participants": [
      {
        "name": "Guest User",
        "email": "guest@example.com",
        "age": "25",
        "canSwim": true,
        "swimmingLevel": "INTERMEDIATE"
      }
    ]
  }'

# Expected: 201 with reservation + token + generatedPassword
```

### Authentication Test
```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Expected: 200 with token and refreshToken
```

### Existing User Guest Checkout
```bash
# Try guest checkout with existing email
curl -X POST http://localhost:4000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 3,
    "participants": [{"name": "Existing", "email": "existing@example.com", "age": "30"}]
  }'

# Expected: 409 with code "ACCOUNT_EXISTS"
```

## Database Schema (Key Models)
- **User:** id, email, name, password, role
- **Class:** id, title, description, schoolId, price, duration
- **ClassSession:** id, classId, date, time, maxCapacity
- **Reservation:** id, userId, classId, sessionId, status, date, time
- **Payment:** id, reservationId, amount, status, voucherUrl
- **School:** id, name, location, logo
- **Instructor:** id, userId, schoolId, bio

## Environment Variables
- `PORT` - Server port (default: 4000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string
- `RESEND_API_KEY` - Email service API key
- `CLOUDINARY_URL` - Image storage URL
- `FRONTEND_URL` - Frontend application URL
