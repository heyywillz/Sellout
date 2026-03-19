#  Sellout Project Documentation

This document provides a deep dive into the architecture, database design, API specifications, and frontend logic of the **Sellout** application.

---

##  System Architecture

Sellout follows a classic **Model-View-Controller (MVC)** architectural pattern, adapted for a decoupled frontend-backend setup.

###  Data Flow

1.  **Client (Frontend)**:
    - Static HTML/CSS/JS files served via `http-server` (port 3000).
    - Uses `fetch` API in `api.js` to communicate with the Backend.
    - Stores JWT tokens in `localStorage` for session management.

2.  **Server (Backend)**:
    - **Node.js + Express** (port 5000): Handles HTTP requests.
    - **Middleware**:
        - `cors`: Handles Cross-Origin Resource Sharing.
        - `auth.js`: Verifies JWT tokens for protected routes.
        - `adminAuth.js`: Checks admin privileges for admin routes.
        - `upload.js`: Uses `multer` to handle `multipart/form-data` file uploads.
        - `express-rate-limit`: API rate limiting for abuse prevention.
    - **Controllers**: Business logic layer (8 controllers).
    - **Cloudinary**: External service for storing uploaded product images.

3.  **Database (MySQL 8.0)**:
    - Relational database with 7 tables.
    - Connected via `mysql2/promise` driver with connection pooling.
    - All schema definitions consolidated in a single `database/schema.sql` file.

---

##  Database Schema

The database consists of seven tables managed through a single `schema.sql` file.

### 1. `users` Table
Stores registered user credentials and profile information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK`, `AUTO_INCREMENT` | Unique user ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | User's display name |
| `email` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | User's email address |
| `google_id` | `VARCHAR(255)` | `NULLABLE` | Google OAuth ID |
| `auth_provider` | `ENUM` | `DEFAULT 'local'` | 'local' or 'google' |
| `password` | `VARCHAR(255)` | `NULLABLE` | Hashed password (null for Google users) |
| `campus` | `VARCHAR(100)` | `NOT NULL` | User's university campus |
| `whatsapp` | `VARCHAR(20)` | `NULLABLE` | Contact number for WhatsApp |
| `profile_image` | `VARCHAR(500)` | `NULLABLE` | Profile image URL |
| `is_verified` | `VARCHAR(20)` | `DEFAULT 'unverified'` | Student verification status |
| `is_admin` | `TINYINT(1)` | `DEFAULT 0` | Admin privilege flag |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation time |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last update time |

### 2. `products` Table
Stores all product listings.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK`, `AUTO_INCREMENT` | Unique product ID |
| `user_id` | `INT` | `FK → users(id)`, `ON DELETE CASCADE` | Seller's user ID |
| `title` | `VARCHAR(200)` | `NOT NULL` | Product title |
| `description` | `TEXT` | | Product description |
| `category` | `ENUM` | `NOT NULL` | Books, Electronics, Fashion, Furniture, Others |
| `product_condition` | `ENUM` | `NOT NULL` | New, Fairly Used, Used |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Price in GHS (₵) |
| `campus` | `VARCHAR(100)` | `NOT NULL` | Campus location |
| `image_url` | `VARCHAR(500)` | `NOT NULL` | Primary image URL |
| `image_public_id` | `VARCHAR(255)` | `NULLABLE` | Cloudinary public ID |
| `status` | `ENUM` | `DEFAULT 'available'` | available / sold |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Listing date |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last update |

**Indexes**: `idx_user_id`, `idx_category`, `idx_campus`, `idx_status`, `idx_price`, `FULLTEXT idx_search (title, description)`

### 3. `favorites` Table
Stores user's saved/wishlisted items.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK` | Unique ID |
| `user_id` | `INT` | `FK → users(id)` | User who favorited |
| `product_id` | `INT` | `FK → products(id)` | Product favorited |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Time of action |

**Constraints**: `UNIQUE (user_id, product_id)` — prevents duplicate favorites.

### 4. `reviews` Table
Stores seller ratings and reviews.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK` | Unique ID |
| `reviewer_id` | `INT` | `FK → users(id)` | User leaving review |
| `seller_id` | `INT` | `FK → users(id)` | User receiving review |
| `product_id` | `INT` | `FK → products(id)` | Product being reviewed |
| `rating` | `TINYINT` | `CHECK (1-5)` | Star rating |
| `comment` | `TEXT` | | Review text |
| `created_at` | `TIMESTAMP` | | Time created |
| `updated_at` | `TIMESTAMP` | | Last update |

**Constraints**: `UNIQUE (reviewer_id, product_id)` — one review per product per user.

### 5. `product_images` Table
Stores additional images for products (multi-image gallery support).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Unique ID |
| `product_id` | `INT` | Associated product (`FK`) |
| `image_url` | `VARCHAR(500)` | Cloudinary URL |
| `image_public_id` | `VARCHAR(255)` | Cloudinary public ID |
| `display_order` | `INT` | Order in gallery |

### 6. `student_verifications` Table
Stores student ID verification submissions for admin review.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Unique ID |
| `user_id` | `INT` | User submitting verification (`FK`) |
| `student_id_image_url` | `VARCHAR(500)` | Uploaded student ID image |
| `student_id_public_id` | `VARCHAR(255)` | Cloudinary public ID |
| `university_name` | `VARCHAR(200)` | University name |
| `student_id_number` | `VARCHAR(100)` | Student ID number |
| `status` | `VARCHAR(20)` | pending / approved / rejected |
| `rejection_reason` | `TEXT` | Reason if rejected |
| `submitted_at` | `TIMESTAMP` | Submission time |
| `reviewed_at` | `TIMESTAMP` | Admin review time |

### 7. `product_reports` Table
Stores flagging/reporting data for inappropriate or scam products.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Unique ID |
| `reporter_id` | `INT` | User reporting the product (`FK`) |
| `product_id` | `INT` | Product being reported (`FK`) |
| `reason` | `ENUM` | scam, inappropriate, duplicate, wrong_category, misleading, other |
| `details` | `TEXT` | Additional text details provided by user |
| `status` | `ENUM` | pending, reviewed, dismissed |
| `admin_note` | `TEXT` | Note left by admin on resolution |
| `created_at` | `TIMESTAMP` | Report time |
| `resolved_at` | `TIMESTAMP` | Admin resolution time |

---

##  API Reference

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints

#### `POST /auth/register`
Creates a new user account.
- **Body**: `{ name, email, password, campus, whatsapp }`
- **Response**: `{ token, user: { id, name, email, ... } }`

#### `POST /auth/login`
Authenticates a user and returns a token.
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email, ... } }`

#### `POST /auth/google`
Authenticates with Google OAuth credentials.
- **Body**: `{ credential }` (Google JWT ID token)
- **Response**: `{ token, user: { id, name, email, ... } }`

#### `GET /auth/me`
Retrieves current user's profile based on the JWT token.
- **Headers**: `Authorization: Bearer <token>`

### Product Endpoints

#### `GET /products`
Fetches a paginated list of products with optional filters.
- **Query Params**:
    - `page` (default: 1)
    - `limit` (default: 12)
    - `search` (keyword — uses full-text search)
    - `category` (filter)
    - `campus` (filter)
    - `condition` (filter)
    - `minPrice`, `maxPrice` (price range)
    - `sortBy` ('newest', 'price_low', 'price_high')

#### `POST /products` (Protected)
Creates a new product listing with support for **multiple images** (up to 5).
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
    - `title`, `description`, `category`, `condition`, `price`, `campus`
    - `images` (Files — up to 5)

#### `PUT /products/:id` (Protected)
Updates an existing product. Only the owner can update.

#### `DELETE /products/:id` (Protected)
Deletes a product and its associated images. Only the owner can delete.

#### `PUT /products/:id/sold` (Protected)
Marks a specific product as "sold".

#### `GET /products/campuses`
Returns a list of all unique campus names from product listings.

### Favorite Endpoints

#### `GET /favorites` (Protected)
Get current user's favorite products with full product details.

#### `POST /favorites/:productId` (Protected)
Toggle favorite status for a product. Returns `{ isFavorited: true/false }`.

#### `GET /favorites/check/:productId` (Protected)
Check if a specific product is in the user's favorites.

### Review Endpoints

#### `GET /reviews/seller/:sellerId`
Get all reviews for a specific seller, including reviewer details.

#### `POST /reviews` (Protected)
Create a review for a transaction.
- **Body**: `{ product_id, rating, comment }`

#### `DELETE /reviews/:id` (Protected)
Delete a review (only by the reviewer who wrote it).

#### `GET /reviews/rating/:sellerId`
Get seller's rating summary (average, total count, distribution).

### Verification Endpoints

#### `POST /verification/submit` (Protected)
Submit a student verification request.
- **Content-Type**: `multipart/form-data`
- **Form Data**: `student_id_image`, `university_name`, `student_id_number`

#### `GET /verification/status` (Protected)
Check the current user's verification status.

### Report Endpoints

#### `POST /reports/:id` (Protected)
Report a product listing.
- **Body**: `{ reason, details }`

#### `GET /reports/check/:id` (Protected)
Check if the current user has already reported this product.

#### `GET /reports` (Admin Only)
Get paginated list of product reports.
- **Query Params**: `page`, `limit`, `status` (pending/reviewed/dismissed), `reason`, `search`

#### `GET /reports/stats` (Admin Only)
Get statistics about reports (total, pending, counts by reason).

#### `PUT /reports/:id/resolve` (Admin Only)
Resolve a single report.
- **Body**: `{ status: 'reviewed' | 'dismissed', admin_note }`

#### `PUT /reports/product/:productId/resolve-all` (Admin Only)
Bulk resolve all reports associated with a specific product.
- **Body**: `{ action: 'delete_product' | 'dismiss_all', admin_note }`

### Admin Endpoints

#### `GET /admin/verifications` (Admin Only)
Get all pending student verification submissions.

#### `PUT /admin/verifications/:id/review` (Admin Only)
Approve or reject a verification.
- **Body**: `{ status: 'approved' | 'rejected', rejection_reason }`

#### `GET /admin/stats` (Admin Only)
Get platform statistics including health metrics.
- **Response includes**: verifications, users, products, categories, reviews, health metrics (sell_through_rate, engagement_rate, verification_rate, listings_per_user)

#### `GET /admin/users` (Admin Only)
Get all users with listing/review counts.
- **Query Params**: `search`, `status` (verified/unverified/admin), `sort` (newest/oldest/name/listings)

#### `GET /admin/users/:id/details` (Admin Only)
Get full user profile with listings, reviews, rating summary, and verification info.

#### `PUT /admin/users/:id/toggle-admin` (Admin Only)
Promote or demote a user's admin role.

#### `GET /admin/products` (Admin Only)
Get all products with seller info. Supports search, category, status, campus filters, sorting, and pagination.
- **Query Params**: `search`, `category`, `status`, `campus`, `sort`, `page`, `limit`

#### `DELETE /admin/products/:id` (Admin Only)
Delete a product and its associated images from Cloudinary. Cleans up favorites and reviews.

#### `GET /admin/campus-analytics` (Admin Only)
Get per-campus statistics (user count, product count, available/sold breakdown, average price).

---

##  Frontend Architecture

The frontend is built with **Vanilla JavaScript** using a modular approach.

### Pages
| File | Description |
|------|-------------|
| `index.html` | Homepage with hero section, categories, and product grid |
| `login.html` | Login page with Google Sign-In option |
| `register.html` | Registration page with Google Sign-Up option |
| `profile.html` | User profile with listings, settings, and verification |
| `product-details.html` | Product detail with gallery, seller info, and reviews |
| `upload-product.html` | New product listing form with image upload |
| `edit-product.html` | Edit existing product listing |
| `favorites.html` | User's saved/wishlisted items |
| `seller.html` | Public seller profile with listings and reviews |
| `admin.html` | Admin dashboard with 6 tabs: Overview, Users, Products, Verifications, Reports, and Campus Analytics |

### Key Modules

- **`js/config.js`**: API URL and environment configuration.
- **`js/api.js`**: Centralized HTTP client with automatic JWT header injection.
- **`js/auth.js`**: Session management — login, register, logout, checkAuth.
- **`js/products.js`**: Product listing, filtering, search, and pagination logic.
- **`js/theme.js`**: Dark mode toggle, localStorage persistence, and theme initialization.
- **`js/utils.js`**: Helper functions — currency formatting (₵), dates, toast notifications.
- **`js/app.js`**: Main application initialization and event binding.

### CSS Architecture
- **`css/style.css`**: Base styles, animations, component styles, and responsive utilities.
- **`css/dark-mode.css`**: Comprehensive dark theme overrides using CSS custom properties. Scoped under `html.dark`.

---

##  Security Implementation

1.  **Password Hashing**:
    - Passwords are **never** stored in plain text.
    - Uses `bcryptjs` to salt and hash passwords before saving to the DB.

2.  **JWT Authentication**:
    - Stateless authentication using JSON Web Tokens.
    - Tokens are signed with a `JWT_SECRET` (HS256 algorithm).
    - Protected routes verify the token signature and expiration date.

3.  **Google OAuth 2.0**:
    - Verified server-side using `google-auth-library`.
    - Users authenticated via Google do not require a password.

4.  **Input Validation**:
    - Backend uses `express-validator` to sanitize and validate all incoming data.
    - Prevents SQL Injection and XSS attacks by rejecting malformed input.

5.  **CORS Policy**:
    - The backend explicitly allows requests only from approved frontend domains.

6.  **Rate Limiting**:
    - API requests are rate-limited using `express-rate-limit` to prevent abuse.

7.  **Image Upload Validation**:
    - File type and size restrictions enforced via `multer` middleware.

---

##  Deployment Guide

### Database (MySQL)
- Use a managed database provider like **PlanetScale**, **Railway**, or **AWS RDS**.
- Execute the single `database/schema.sql` file to initialize all tables and seed data:
  ```bash
  mysql -u root -p < database/schema.sql
  ```

### Backend (Node.js)
- Host on **Render**, **Railway**, or **Heroku**.
- Set the following Environment Variables in the hosting dashboard:
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
    - `JWT_SECRET`, `JWT_EXPIRES_IN`
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
    - `GOOGLE_CLIENT_ID`
    - `FRONTEND_URL`

### Frontend (Static)
- Host on **Vercel** or **Netlify**.
- Simply upload the `frontend` folder or connect your Git repository.
- **Important**: Update `js/config.js` to point to your *production* Backend URL.

---

##  Troubleshooting

- **Image Upload Fails**:
    - Check Cloudinary credentials in `.env`.
    - Ensure the file is a valid image (JPG, PNG) and under 5MB.
- **"Network Error" or "Failed to Fetch"**:
    - Ensure the backend server is running (`npm run dev`).
    - Verify `API_URL` in `js/config.js` matches the backend address.
- **Database Connection Error**:
    - Check if MySQL service is running (`MySQL80` service on Windows).
    - Verify DB credentials in `.env`.
- **Google Sign-In Not Working**:
    - Verify `GOOGLE_CLIENT_ID` is set in both `.env` and the frontend HTML.
    - Ensure the authorized JavaScript origins include your frontend URL.
