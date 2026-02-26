# 📘 Sellout Project Documentation

This document provides a deep dive into the architecture, database design, API specifications, and frontend logic of the **Sellout** application.

---

## 🏗️ System Architecture

Sellout follows a classic **Model-View-Controller (MVC)** architectural pattern, adapted for a decoupled frontend-backend setup.

### 🔄 Data Flow

1.  **Client (Frontend)**: 
    - Static HTML/CSS/JS files served via `http-server` or any static host.
    - Uses `fetch` API in `api.js` to communicate with the Backend.
    - Stores JWT tokens in `localStorage` for session management.

2.  **Server (Backend)**:
    - **Node.js + Express**: Handles HTTP requests.
    - **Middleware**: 
        - `cors`: Handles Cross-Origin Resource Sharing.
        - `auth`: Verifies JWT tokens for protected routes.
        - `upload`: Uses `multer` to handle `multipart/form-data` file uploads.
    - **Controllers**: Business logic layer (e.g., `productController.js`).
    - **Cloudinary**: External service for storing uploaded product images.

3.  **Database (MySQL)**:
    - Relational database storing Users and Products.
    - Connected via `mysql2` driver with connection pooling.

---

## 🗄️ Database Schema

The database consists of two primary tables: `users` and `products`.

### 1. `users` Table
Stores registered user credentials and profile information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK`, `AUTO_INCREMENT` | Unique user ID |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User's display name |
| `email` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | User's email address |
| `password` | `VARCHAR(255)` | `NULLABLE` | Hashed password (null for Google users) |
| `google_id` | `VARCHAR(255)` | `UNIQUE`, `NULLABLE` | Google OAuth ID |
| `auth_provider`| `ENUM` | `DEFAULT 'local'` | 'local' or 'google' |
| `phone_number` | `VARCHAR(20)` | `NULLABLE` | Contact number for WhatsApp |
| `campus` | `VARCHAR(100)` | `NOT NULL` | User's university campus |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation time |

### 3. `favorites` Table
Stores user's saved items.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Unique ID (`PK`) |
| `user_id` | `INT` | User who favorited (`FK`) |
| `product_id` | `INT` | Product favorited (`FK`) |
| `created_at` | `TIMESTAMP` | Time of action |

### 4. `reviews` Table
Stores seller ratings and reviews.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK` | Unique ID |
| `reviewer_id` | `INT` | `FK` | User leaving review |
| `seller_id` | `INT` | `FK` | User receiving review |
| `product_id` | `INT` | `FK` | Product being reviewed |
| `rating` | `TINYINT` | `1-5` | Star rating |
| `comment` | `TEXT` | | Review text |

### 5. `product_images` Table
Stores additional images for products (multi-image support).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Unique ID |
| `product_id` | `INT` | Associated product |
| `image_url` | `VARCHAR` | Cloudinary URL |
| `display_order` | `INT` | Order in gallery |

---

## 📡 API Reference

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints

#### `POST /auth/register`
Creates a new user account.
- **Body**: `{ full_name, email, password, phone_number, campus }`
- **Response**: `{ token, user: { id, email, ... } }`

#### `POST /auth/login`
Authenticates a user and returns a token.
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, email, ... } }`

#### `POST /auth/google`
Authenticates with Google OAuth credentials.
- **Body**: `{ credential }` (Google JWT)
- **Response**: `{ token, user: { id, email, ... } }`

#### `GET /auth/me`
Retrieves current user's profile based on the JWT token in `Authorization` header.
- **Headers**: `Authorization: Bearer <token>`

### Product Endpoints

#### `GET /products`
Fetches a paginated list of products with optional filters.
- **Query Params**:
    - `page` (default: 1)
    - `limit` (default: 10)
    - `search` (keyword)
    - `category` (filter)
    - `campus` (filter)
    - `condition` (filter)
    - `minPrice`, `maxPrice` (range)
    - `sortBy` ('newest', 'price_low', 'price_high')

#### `POST /products` (Protected)
Creates a new product listing with support for **multiple images** (up to 5).
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
    - `title`, `description`, `category`, `condition`, `price`, `campus`
    - `images` (Files - up to 5)

#### `PUT /products/:id` (Protected)
Updates an existing product. Only the owner can update.

#### `DELETE /products/:id` (Protected)
Deletes a product. Only the owner can delete.

#### `PUT /products/:id/sold` (Protected)
Marks a specific product as "sold".

### Favorite Endpoints

#### `GET /favorites` (Protected)
Get current user's favorite products.

#### `POST /favorites/:productId` (Protected)
Toggle favorite status for a product. Returns `{ isFavorited: true/false }`.

#### `GET /favorites/check/:productId` (Protected)
Check if a specific product is in the user's favorites.

### Review Endpoints

#### `GET /reviews/seller/:sellerId`
Get all reviews for a specific seller.

#### `POST /reviews` (Protected)
Create a review for a transaction.
- **Body**: `{ product_id, rating, comment }`

#### `DELETE /reviews/:id` (Protected)
Delete a review (only by the reviewer).

---

## 💻 Frontend Architecture

The frontend is built with **Vanilla JavaScript** using a modular approach.

### Key Modules

- **`js/api.js`**:
    - Centralized HTTP client.
    - Handles `fetch` requests (GET, POST, PUT, DELETE).
    - Automatically attaches `Authorization` header if a token exists.
    - Manages base API URL configuration.

- **`js/auth.js`**:
    - Manages user session state.
    - Functions: `login()`, `register()`, `logout()`, `checkAuth()`.
    - Updates UI elements (e.g., hiding "Login" button when logged in).

- **`js/products.js`**:
    - Core logic for fetching and rendering products.
    - Functions: `loadProducts()`, `renderProducts()`, `handleSearch()`.
    - Implements infinite scroll or pagination logic.

- **`js/utils.js`**:
    - Helper functions for formatting dates, currency (₵), and showing toast notifications.

### Configuration
`js/config.js` contains environment-specific settings:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:5000/api', // Change for production
    CLOUDINARY_CLOUD_NAME: '...', // If needed on frontend
};
```

---

## 🔒 Security Implementation

1.  **Password Hashing**:
    - Passwords are **never** stored in plain text.
    - We use `bcryptjs` to salt and hash passwords before saving to the DB.

2.  **JWT Authentication**:
    - Stateless authentication using JSON Web Tokens.
    - Tokens are signed with a `JWT_SECRET` (HS256 algorithm).
    - Protected routes verify the token signature and expiration date.

3.  **Input Validation**:
    - Backend uses `express-validator` to sanitize and validate all incoming data.
    - Prevents SQL Injection and XSS attacks by rejecting malformed input.

4.  **CORS Policy**:
    - The backend explicitly allows requests *only* from approved frontend domains (configured in `server.js`).

---

## 🚀 Deployment Guide

### Database (MySQL)
- Use a managed database provider like **PlanetScale**, **Railway**, or **AWS RDS**.
- Execute the schema SQL script to initialize tables.

### Backend (Node.js)
- Host on **Render**, **Railway**, or **Heroku**.
- Set the following Environment Variables in the hosting dashboard:
    - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
    - `JWT_SECRET`
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Frontend (Static)
- Host on **Vercel** or **Netlify**.
- Simply upload the `frontend` folder or connect your Git repository.
- **Important**: Update `js/config.js` to point to your *production* Backend URL (e.g., `https://sellout-api.onrender.com/api`).

---

## 🛠️ Troubleshooting

- **Image Upload Fails**: 
    - Check Cloudinary credentials in `.env`.
    - Ensure the file is a valid image (JPG, PNG) and under 5MB.
- **"Network Error" or "Failed to Fetch"**:
    - Ensure the backend server is running (`npm run dev`).
    - Verify `API_URL` in `js/config.js` matches the backend address.
- **Database Connection Error**:
    - Check if MySQL service is running locally (`Display Name: MySQL80` or similar services).
    - Verify DB credentials in `.env`.

