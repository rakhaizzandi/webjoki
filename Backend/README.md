# Web Joki MLBB Backend

Backend API for Web Joki MLBB application built with Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Joki services management
- Order processing
- JWT authentication

## Installation

1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables in `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/webjoki
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start the server:
   ```
   npm start
   ```

   For development:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Services
- `GET /api/services` - Get all joki services

### Orders
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing