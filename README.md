# WonderTech - Group Activity Recording Platform

A modern full-stack web application for conducting and recording group activities with video and audio capabilities.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🔐 Authentication

- User registration with validation (name, email, password)
- Secure login with JWT tokens
- Password hashing with bcrypt (12 salt rounds)
- Token-based session management (7-day expiration)
- Protected routes and API endpoints

### 📹 Recording

- **Video + Audio Recording** using MediaRecorder API
- **Consent Modal** before recording starts
- **Real-time Status** with animated recording indicator
- **Automatic Upload** after recording stops
- **File Validation** (max 100MB, video/audio formats only)
- **Secure Storage** in backend uploads directory

### 📊 Dashboard

- Personalized welcome message
- PDF instructions viewer (modal + new window)
- View/Download/Delete recordings
- My Recordings list with timestamps
- Auto-refresh after upload/delete

### 🎨 Modern UI/UX

- Beautiful responsive design with Tailwind CSS
- Custom color palette and gradients
- Loading states and error handling
- Success/error notifications
- Modal dialogs and smooth animations

### 🔒 Security

- JWT authentication
- Bcrypt password hashing
- CORS protection
- Helmet security headers
- SQL injection prevention (parameterized queries)
- Input validation (Zod backend, Yup frontend)
- Strict TypeScript type safety

---

## 🏗️ Tech Stack

### Frontend

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Hook Form** + **Yup** - Form validation
- **TanStack Query** - Data fetching & caching
- **React Router** - Navigation
- **Axios** - HTTP client with interceptors

### Backend

- **Express.js** + **TypeScript**
- **MySQL** - Database with connection pooling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **Zod** - Runtime validation

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MySQL** 8+

### 1. Automated Setup (Recommended)

**Windows (PowerShell):**

```powershell
.\setup.ps1
```

**macOS/Linux:**

```bash
chmod +x setup.sh && ./setup.sh
```

### 2. Manual Setup

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE wondertech_db;
```

Update `backend/.env` with your MySQL password:

```env
DB_PASSWORD=your_mysql_password_here
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Open in Browser

Navigate to **http://localhost:5173**

- Register a new account
- Click "Start Group Activity"
- Accept permissions and record
- Click "Stop Recording"
- Done! ✅

---

## 📦 Installation

### Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wondertech_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Available Commands

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:backend      # Run backend only (http://localhost:5000)
npm run dev:frontend     # Run frontend only (http://localhost:5173)

# Build
npm run build            # Build for production
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
```

---

## 🔌 API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Recording Endpoints (Protected)

#### Upload Recording

```http
POST /api/recordings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

recording: <file.webm>
```

**Response (201):**

```json
{
  "message": "Recording saved successfully",
  "recording": {
    "id": 1,
    "user_id": 1,
    "filepath": "recording-1234567890-123456789.webm"
  }
}
```

#### Get User Recordings

```http
GET /api/recordings/user/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**

```json
{
  "recordings": [
    {
      "id": 1,
      "user_id": 1,
      "filepath": "recording-1234567890-123456789.webm",
      "created_at": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

#### Delete Recording

```http
DELETE /api/recordings/:recordingId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**

```json
{
  "message": "Recording deleted successfully"
}
```

### Static File Endpoints

#### Get Recording File

```http
GET /uploads/:filename
```

#### Get PDF Instructions

```http
GET /public/Group_Activity_Instructions.pdf
```

---

## 🗄️ Database Schema

### users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

### recordings Table

```sql
CREATE TABLE recordings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

**Features:**

- Foreign key constraint with cascade delete
- Indexed columns for performance
- UTF8MB4 character set support
- Automatic timestamp tracking

---

## 📁 Project Structure

```
wonderTech/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # MySQL connection & schema
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Auth logic
│   │   │   └── recordingController.ts # Recording logic
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   └── errorHandler.ts       # Error handling
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # Auth endpoints
│   │   │   └── recordingRoutes.ts    # Recording endpoints
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   ├── validators/
│   │   │   └── auth.ts               # Zod schemas
│   │   └── server.ts                 # Express app
│   ├── uploads/                      # Recording storage
│   ├── public/                       # Static files (PDF)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.ts              # Axios instance
│   │   │   ├── auth.ts               # Auth API calls
│   │   │   └── recordings.ts         # Recording API calls
│   │   ├── components/
│   │   │   ├── ConsentModal.tsx      # Consent popup
│   │   │   └── PDFModal.tsx          # PDF viewer
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Auth state management
│   │   ├── hooks/
│   │   │   └── useMediaRecorder.ts   # Recording hook
│   │   ├── pages/
│   │   │   ├── Login.tsx             # Login/Register page
│   │   │   └── Dashboard.tsx         # Main dashboard
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   ├── validators/
│   │   │   └── auth.ts               # Yup schemas
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
└── package.json                      # Root workspace config
```

---

## 🔒 Security

### Authentication

- **JWT Tokens** with 7-day expiration
- **bcrypt** password hashing (12 salt rounds)
- **Protected Routes** require valid JWT
- **Token Verification** on every request

### API Security

- **CORS** configured for frontend origin
- **Helmet** adds security headers
- **Input Validation** with Zod/Yup
- **SQL Injection Prevention** via parameterized queries
- **File Upload Validation** (type, size limits)

### Data Protection

- **Passwords** never stored in plain text
- **User Authorization** checks on all operations
- **Ownership Validation** for recordings
- **Secure File Storage** with unique filenames

---

## 🧪 Testing

### Test Recording Flow

1. **Login/Register**

   ```
   http://localhost:5173
   ```

2. **Start Recording**

   - Click "Start Group Activity"
   - Accept consent
   - Grant browser permissions
   - Record for 5-10 seconds
   - Click "Stop Recording"

3. **Verify Upload**

   - See success message
   - Recording appears in "My Recordings"

4. **Check Database**

   ```sql
   USE wondertech_db;
   SELECT * FROM recordings;
   ```

5. **Check Filesystem**

   ```bash
   # Windows
   dir backend\uploads

   # macOS/Linux
   ls -lh backend/uploads/
   ```

### Test Delete Functionality

1. Click "Delete" on any recording
2. Confirm in popup
3. Verify:
   - Recording removed from UI
   - File deleted from `backend/uploads/`
   - Database entry removed

### Test API with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get Recordings (use token from login)
curl http://localhost:5000/api/recordings/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Access denied for user 'root'@'localhost'`

**Solutions:**

1. Check MySQL is running:

   ```bash
   # Windows
   net start MySQL80

   # macOS
   brew services start mysql

   # Linux
   sudo service mysql status
   ```

2. Verify credentials in `backend/.env`
3. Test MySQL connection:

   ```bash
   mysql -u root -p
   ```

4. Ensure database exists:
   ```sql
   CREATE DATABASE wondertech_db;
   ```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solutions:**

**Windows:**

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**

```bash
lsof -ti:5000 | xargs kill -9
```

### Camera/Microphone Not Working

**Issues:**

- Browser not requesting permissions
- Permissions denied
- Camera already in use

**Solutions:**

1. Use **HTTPS** or **localhost** (required for MediaRecorder API)
2. Check browser permissions (Chrome: Settings → Privacy → Camera/Microphone)
3. Try different browser (Chrome or Firefox recommended)
4. Close other apps using camera/microphone
5. Check browser console for specific errors

### Recording Upload Fails

**Error:** File upload fails or returns 400

**Solutions:**

1. Check file size (max 100MB)
2. Verify file format (video/webm, video/mp4, audio/webm, audio/wav)
3. Ensure JWT token is valid
4. Check backend logs for errors
5. Verify `backend/uploads/` directory exists and is writable

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**

1. Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL
2. Restart backend server after changing `.env`
3. Clear browser cache
4. Check browser dev tools Network tab for actual error

### Build Errors

**Error:** TypeScript compilation errors

**Solutions:**

1. Delete `node_modules` and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript version compatibility
3. Run type check:
   ```bash
   cd backend && npx tsc --noEmit
   cd ../frontend && npx tsc --noEmit
   ```

---

## 📚 Development Guidelines

### TypeScript Best Practices

- ✅ Never use `any` (use `unknown` instead)
- ✅ Explicit function return types
- ✅ Runtime validation with Zod
- ✅ Strict null checks enabled
- ✅ No unused variables/parameters

### Code Organization

- ✅ MVC pattern for backend
- ✅ Component-based frontend architecture
- ✅ Custom hooks for reusable logic
- ✅ Context API for global state
- ✅ Clear separation of concerns

### API Design

- ✅ RESTful conventions
- ✅ Consistent error responses
- ✅ Proper HTTP status codes
- ✅ Request/response validation
- ✅ Pagination for large datasets (if needed)

---

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

1. Set `NODE_ENV=production` in backend `.env`
2. Use strong `JWT_SECRET` (minimum 32 characters)
3. Configure production database
4. Set up proper CORS origins
5. Enable HTTPS
6. Configure file upload limits based on requirements

### Recommended Hosting

- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** AWS EC2, Heroku, or DigitalOcean
- **Database:** AWS RDS, PlanetScale, or managed MySQL

---

## 📝 License

This project is proprietary software for WonderTech.

---

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React, Express, TypeScript, and MySQL**
