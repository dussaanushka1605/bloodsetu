# RaktSetu Backend

Backend server for RaktSetu - Blood Donor Finder Platform

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/raktsetu
JWT_SECRET=your-secret-key
```

3. Start MongoDB:
Make sure MongoDB is running on your local machine at mongodb://localhost:27017

4. Run the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Donor
- POST `/api/auth/register/donor` - Register a new donor
- POST `/api/auth/login/donor` - Login donor
- GET `/api/auth/profile` - Get current user profile

#### Hospital
- POST `/api/auth/register/hospital` - Register a new hospital
- POST `/api/auth/login/hospital` - Login hospital
- GET `/api/auth/profile` - Get current user profile

### Admin
- POST `/api/admin/login` - Admin login
- GET `/api/admin/hospitals/pending` - Get pending hospitals
- PATCH `/api/admin/hospitals/:id/verify` - Verify a hospital
- GET `/api/admin/hospitals` - Get all hospitals
- DELETE `/api/admin/hospitals/:id` - Delete a hospital

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles

1. Admin
   - Email: admin@raktsetu.com
   - Password: Admin@123

2. Donor
   - Register via form
   - Access donor dashboard after login

3. Hospital
   - Register via form
   - Requires admin verification
   - Access hospital dashboard after verification 