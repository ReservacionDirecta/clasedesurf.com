# PRD - Frontend (clasedesurf.com)

## Product Overview
**Name:** Clase de Surf - Frontend Application  
**Version:** 2.0.0  
**Type:** Next.js Web Application  
**URL:** https://clasedesurf.com

## Tech Stack
- **Framework:** Next.js 15.5.9
- **UI Library:** React 19
- **Styling:** TailwindCSS 4
- **Authentication:** NextAuth.js 4
- **Language:** TypeScript 5
- **State Management:** React Hooks
- **HTTP Client:** Axios / Fetch API

## Core Features

### 1. Authentication System
- **Login/Register:** Email & password authentication
- **Google OAuth:** Social login with Google
- **Session Management:** JWT-based sessions via NextAuth
- **Role-based Access:** STUDENT, INSTRUCTOR, SCHOOL_ADMIN, ADMIN roles
- **Guest Checkout:** Allow unauthenticated users to book and create account automatically

### 2. Class Booking System
- **Class Browsing:** View all available surf classes with filters
- **Class Details:** View complete class information at `/classes/[id]`
- **Date/Time Selection:** Select from available session dates and times
- **Participant Management:** Add multiple participants with details
- **Booking Modal:** Multi-step booking form with validation
- **Session Storage Persistence:** Preserve booking state across page navigation

### 3. Guest Checkout Flow
- **State Preservation:** Booking data persists in sessionStorage across login redirects
- **Choice UI:** Clear options to "Login" or "Continue as Guest" 
- **Auto Account Creation:** Creates user account with generated password
- **Auto Login:** Automatically logs in new guest users after booking
- **Email Notification:** Sends welcome email with login credentials

### 4. Reservation Management
- **Confirmation Page:** `/reservations/confirmation` - Review and confirm bookings
- **My Reservations:** `/reservations` - View user's booking history
- **Cancellation:** Cancel pending reservations
- **Status Tracking:** Track reservation status (PENDING, CONFIRMED, CANCELED)

### 5. Payment System
- **Voucher Upload:** Upload payment proof (Yape, Plin, bank transfer)
- **Discount Codes:** Apply promotional codes for discounts
- **Payment Status:** Track payment verification status

### 6. Dashboard (Role-specific)
- **Student Dashboard:** View reservations, upcoming classes
- **Instructor Dashboard:** Manage assigned classes, view schedules
- **School Admin Dashboard:** Manage school, classes, instructors, students, payments
- **Super Admin Dashboard:** System-wide management

### 7. Home Page
- **Hero Section:** Featured promotional content
- **Class Listings:** Display available classes
- **Instructor Spotlight:** Highlight featured instructors
- **School Showcase:** Display partner schools

## Test Scenarios (Frontend)

### Guest Checkout Flow
1. Navigate to `/classes/3` (or any class page)
2. Click "Reservar" to open booking modal
3. Fill in participant details (name, email, age, etc.)
4. Select date and time
5. Click "Continuar" to proceed to confirmation
6. On confirmation page, select "Continuar como invitado"
7. Complete booking without logging in first
8. Verify reservation is created and user is auto-logged in

### Login Flow with Booking Persistence
1. Start booking process as above
2. On confirmation page, click "Iniciar sesión"
3. Complete login process
4. Verify booking data is preserved after redirect back
5. Complete booking as authenticated user

### Class Browsing
1. Navigate to home page
2. View featured classes
3. Click on a class to view details
4. Verify class information is displayed correctly

### Reservation Management
1. Login as a user with reservations
2. Navigate to `/reservations`
3. View list of reservations
4. Check reservation details and status

## API Endpoints Used
- `POST /api/reservations` - Create reservation
- `GET /api/classes` - List classes
- `GET /api/classes/:id` - Get class details
- `GET /api/reservations` - Get user reservations
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
