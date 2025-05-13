# CRM Portal

A full-stack CRM application with customer management, segmentation, campaign creation, and analytics.

## Features

- User authentication and authorization
- Customer management
- Customer segmentation with custom rules
- Marketing campaign creation and tracking
- Order management
- Analytics dashboard
- Responsive design

## Tech Stack

### Frontend
- React.js
- Material UI
- React Router
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   CORS_ORIGIN=http://localhost:3000
   ```

4. Seed the database with sample data:
   ```
   npm run data:import
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

5. The application should now be running at `http://localhost:3000`

## Usage

### Demo Credentials
- Email: admin@xeno.com
- Password: 123456

Or use the "Login as Demo User" option.

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Authenticate a user
- GET /api/auth/profile - Get user profile (requires authentication)
- PUT /api/auth/profile - Update user profile (requires authentication)

### Customers
- GET /api/customers - Get all customers
- GET /api/customers/:id - Get a specific customer
- POST /api/customers - Create a new customer
- PUT /api/customers/:id - Update a customer
- DELETE /api/customers/:id - Delete a customer

### Segments
- GET /api/segments - Get all segments
- GET /api/segments/:id - Get a specific segment
- POST /api/segments - Create a new segment
- PUT /api/segments/:id - Update a segment
- DELETE /api/segments/:id - Delete a segment

### Campaigns
- GET /api/campaigns - Get all campaigns
- GET /api/campaigns/:id - Get a specific campaign
- POST /api/campaigns - Create a new campaign
- PUT /api/campaigns/:id - Update a campaign
- DELETE /api/campaigns/:id - Delete a campaign

### Orders
- GET /api/orders - Get all orders
- GET /api/orders/:id - Get a specific order
- POST /api/orders - Create a new order
- PUT /api/orders/:id - Update an order
- DELETE /api/orders/:id - Delete an order

### Dashboard
- GET /api/dashboard/statistics - Get dashboard statistics
- GET /api/dashboard/recent-activity - Get recent activity
- GET /api/dashboard/top-customers - Get top customers
- GET /api/dashboard/performance-metrics - Get performance metrics

## License
MIT