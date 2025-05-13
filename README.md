# CRM Portal

A full-stack CRM application for customer management, segmentation, campaign creation, order management, and analytics.

---

## Hosted Demo
[Live Demo](https://xen0crm.netlify.app/)

## Screenshots
![Login](/screenshots/login.png)
![Dashboard](/screenshots/dashboard.png)
![Segment Builder](/screenshots/segment-builder.png)
![Campaign Creation](/screenshots/campaign-creation.png)
![Campaign History](/screenshots/campaign-history.png)
![Data Ingestion](/screenshots/data-ingestion.png)
---

## Features

- User authentication (email/password & Google OAuth)
- Customer management (CRUD, segmentation, tagging)
- Segment builder with custom rules
- Marketing campaign creation and tracking
- Order management and import (CSV/JSON)
- Analytics dashboard with KPIs and reports
- Responsive UI (React + Material UI)

---

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

---

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

---

### Backend Setup

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```

2. Install dependencies:
   ```sh
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
   ```sh
   npm run data:import
   ```

5. Start the backend server:
   ```sh
   npm run dev
   ```

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```sh
   npm start
   ```

5. The application should now be running at [http://localhost:3000](http://localhost:3000)

---

## Usage

### Demo Credentials

- Email: `admin@xeno.com`
- Password: `123456`

Or use the "Demo account" option on the login page.

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile (auth required)
- `PUT /api/auth/profile` - Update user profile (auth required)

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Segments

- `GET /api/segments` - Get all segments
- `GET /api/segments/:id` - Get a specific segment
- `POST /api/segments` - Create a new segment
- `PUT /api/segments/:id` - Update a segment
- `DELETE /api/segments/:id` - Delete a segment

### Campaigns

- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get a specific campaign
- `POST /api/campaigns` - Create a new campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Delete a campaign

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

### Dashboard

- `GET /api/dashboard/statistics` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/top-customers` - Get top customers
- `GET /api/dashboard/performance-metrics` - Get performance metrics

---

## Folder Structure

```
backend/
  controllers/
  middleware/
  models/
  routes/
  seed/
  server.js
  .env
  package.json

frontend/
  src/
    components/
    services/
    App.js
    index.js
  public/
  .env
  package.json
```

---

## License

MIT

---