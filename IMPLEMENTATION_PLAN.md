# Sellout - Campus Resale Marketplace Implementation Plan

## Project Overview
A full-stack web application for university students to buy and sell used items within their campus community.

## Tech Stack
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript, Google Fonts (Inter), Font Awesome Icons
- **Backend**: Node.js (Express.js)
- **Database**: MySQL 8.0
- **Image Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens) + Google OAuth 2.0

## Project Structure
```
Sellout/
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── cloudinary.js        # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js    # Login, register, Google auth
│   │   ├── userController.js    # Profile management
│   │   ├── productController.js # Product CRUD operations
│   │   ├── favoriteController.js # Wishlist management
│   │   ├── reviewController.js  # Seller reviews & ratings
│   │   ├── verificationController.js # Student ID verification
│   │   └── adminController.js   # Admin dashboard & management
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── admin.js             # Admin role check middleware
│   │   └── upload.js            # Multer file upload config
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User profile routes
│   │   ├── products.js          # Product routes
│   │   ├── favorites.js         # Favorites routes
│   │   ├── reviews.js           # Review routes
│   │   ├── verification.js      # Verification routes
│   │   └── admin.js             # Admin routes
│   ├── .env                     # Environment variables
│   ├── server.js                # Express app entry point
│   ├── seed.js                  # Demo data seeder
│   ├── migrate.js               # Database migrations
│   ├── migrate_auth.js          # Google auth migration
│   ├── migrate_verification.js  # Verification migration
│   └── package.json
├── frontend/
│   ├── assets/                  # Logo and student images
│   ├── css/
│   │   ├── style.css            # Custom styles & animations
│   │   └── dark-mode.css        # Dark mode theme overrides
│   ├── js/
│   │   ├── api.js               # Centralized HTTP client
│   │   ├── app.js               # Main app initialization
│   │   ├── auth.js              # Auth session management
│   │   ├── config.js            # API URL & settings
│   │   ├── products.js          # Product listing & filtering
│   │   ├── theme.js             # Dark mode toggle & persistence
│   │   └── utils.js             # Helpers (toast, currency, dates)
│   ├── index.html               # Homepage with hero & listings
│   ├── login.html               # Login page
│   ├── register.html            # Registration page
│   ├── profile.html             # User profile page
│   ├── product-details.html     # Product detail view
│   ├── upload-product.html      # New product listing form
│   ├── edit-product.html        # Edit product form
│   ├── favorites.html           # Wishlist page
│   ├── seller.html              # Public seller profile
│   └── admin.html               # Admin dashboard
├── database/
│   └── schema.sql               # Complete DB schema (single file)
├── PROPOSAL.md
├── IMPLEMENTATION_PLAN.md
├── DOCUMENTATION.md
└── README.md
```

## Implementation Phases

### Phase 1: Database Setup ✅
- Created consolidated MySQL schema (`schema.sql`)
- Defined 6 tables: users, products, favorites, reviews, product_images, student_verifications
- Added indexes for performance (full-text search, foreign keys)
- Seed data with demo user and 12 sample products

### Phase 2: Backend Foundation ✅
- Initialized Node.js project with Express
- Configured MySQL connection pool via `mysql2/promise`
- Configured Cloudinary for image hosting
- Set up environment variables via `dotenv`

### Phase 3: Authentication System ✅
- User registration with input validation (`express-validator`)
- Password hashing with `bcryptjs`
- JWT token generation and verification
- **Google OAuth 2.0 Integration**:
    - Backend: Verify Google ID token via `google-auth-library`
    - Frontend: Google Sign-In button on login/register pages
- Login/logout functionality
- Protected routes middleware (`auth.js`)
- Optional auth middleware for public routes that benefit from user context

### Phase 4: Product Management API ✅
- Full CRUD operations for products
- Multi-image upload to Cloudinary (up to 5 images)
- Campus-based filtering
- Full-text search across title and description
- Advanced filtering: category, condition, price range
- Sorting: newest, price low-to-high, price high-to-low
- Pagination support
- Mark as sold functionality

### Phase 5: Frontend Development ✅
- Responsive layout with Tailwind CSS
- Premium white-dominant design with green accent colors
- Authentication pages (login, register with Google Sign-In)
- Homepage with animated hero section and floating student images
- Product listing with filters and sorting
- Product detail page with image gallery
- Product upload/edit forms with drag-and-drop image upload
- Profile management page
- Public seller profile page
- WhatsApp integration for buyer-seller communication

### Phase 6: Polish & UX ✅
- Toast notifications (success, error, warning)
- Skeleton loading states
- Empty states for no results
- Comprehensive error handling
- Mobile-first responsive design
- Smooth CSS animations and micro-interactions
- Hero section with floating cards and decorative dots

### Phase 7: Enhanced Features ✅
- **Wishlist/Favorites**:
    - Toggle favorite status with heart animation
    - Dedicated favorites page
    - Favorite count indicators
- **Seller Reviews**:
    - Star ratings (1-5) with text comments
    - Seller rating summary with distribution bars
    - Review moderation (delete own review)
- **Multi-Image Upload**:
    - Support for up to 5 images per product
    - Gallery view with navigation in product details
    - Primary image designation
- **Student Verification**:
    - Submit student ID image and university info
    - Admin review workflow (approve/reject with reason)
    - Verification status badges on profiles
- **Admin Dashboard**:
    - Platform statistics (users, products, verifications)
    - Pending verification queue
    - Approve/reject verifications
    - User management with search, filter, and sort
    - Campus analytics with charts

### Phase 8: Admin Dashboard Enhancement ✅
- **Product Management Tab**:
    - Searchable/filterable product table with pagination
    - Admin product deletion with Cloudinary cleanup
    - View and delete actions per product
- **User Detail Drawer**:
    - Slide-out panel with full user profile, listings, reviews
    - Rating summary, total earnings, verification info
    - Accessible from Users and Products tabs
- **Pending Verification Badge**:
    - Animated red badge on Verifications tab with pending count
    - Auto-updates when Overview loads
- **Platform Health Metrics**:
    - Sell-through rate, listings/user, verification rate, engagement rate
    - Animated counter display with cubic easing
- **CSV Data Export**:
    - Export Users and Products tables to CSV files
    - Client-side generation with automatic download
- **Dark-Mode-Aware Charts**:
    - Chart.js charts adapt grid, labels, and borders to active theme
    - Overview and Campus Analytics charts fully dark-mode compatible

### Phase 9: Dark Mode ✅
- Full dark mode toggle with `theme.js` module
- CSS custom properties for dark palette (`dark-mode.css`)
- Theme persistence via localStorage
- Dark mode overrides for all pages: homepage, login, register, profile, product details, admin dashboard
- Conditional Google button rendering (filled_black theme in dark mode)
- Comprehensive dark mode styling for:
    - Navigation, hero section, category cards, product cards
    - Forms, modals, tables, charts
    - Admin dashboard stat cards, tabs, filters, tables
    - User detail drawer, products tab, health metrics
    - Footer, badges, verification panel

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/google` | No | Google OAuth login |
| GET | `/api/auth/me` | Yes | Get current user |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | Yes | Get user profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| PUT | `/api/users/password` | Yes | Change password |
| GET | `/api/users/products` | Yes | Get user's products |
| GET | `/api/users/:id` | No | Get public seller profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | Get all products (with filters) |
| GET | `/api/products/:id` | No | Get single product |
| POST | `/api/products` | Yes | Create product (multi-image) |
| PUT | `/api/products/:id` | Yes | Update product |
| DELETE | `/api/products/:id` | Yes | Delete product |
| PUT | `/api/products/:id/sold` | Yes | Mark as sold |
| GET | `/api/products/campuses` | No | Get all campus names |

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | Yes | Get user's favorites |
| POST | `/api/favorites/:id` | Yes | Toggle favorite |
| GET | `/api/favorites/check/:id` | Yes | Check if favorited |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/seller/:id` | No | Get seller reviews |
| POST | `/api/reviews` | Yes | Create review |
| DELETE | `/api/reviews/:id` | Yes | Delete review |
| GET | `/api/reviews/rating/:id` | No | Get rating summary |

### Verification
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/verification/submit` | Yes | Submit student ID |
| GET | `/api/verification/status` | Yes | Check verification status |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/verifications` | Admin | Get pending verifications |
| PUT | `/api/admin/verifications/:id/review` | Admin | Approve/reject verification |
| GET | `/api/admin/stats` | Admin | Get dashboard statistics + health metrics |
| GET | `/api/admin/users` | Admin | List users with search/filter/sort |
| GET | `/api/admin/users/:id/details` | Admin | Full user profile with listings/reviews |
| PUT | `/api/admin/users/:id/toggle-admin` | Admin | Promote/demote admin role |
| GET | `/api/admin/products` | Admin | List products with search/filter/pagination |
| DELETE | `/api/admin/products/:id` | Admin | Delete product (admin moderation) |
| GET | `/api/admin/campus-analytics` | Admin | Campus-level user/product stats |

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(100) | Unique email |
| google_id | VARCHAR(255) | Google OAuth ID |
| auth_provider | ENUM('local','google') | Authentication method |
| password | VARCHAR(255) | Hashed password (nullable for Google users) |
| campus | VARCHAR(100) | University/campus |
| whatsapp | VARCHAR(20) | WhatsApp number |
| profile_image | VARCHAR(500) | Profile image URL |
| is_verified | VARCHAR(20) | Verification status (unverified/pending/verified) |
| is_admin | TINYINT(1) | Admin flag |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update |

### products
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| user_id | INT | Foreign key to users |
| title | VARCHAR(200) | Product title |
| description | TEXT | Product description |
| category | ENUM | Books, Electronics, Fashion, Furniture, Others |
| product_condition | ENUM | New, Fairly Used, Used |
| price | DECIMAL(10,2) | Price in GHS (₵) |
| campus | VARCHAR(100) | Campus location |
| image_url | VARCHAR(500) | Primary image URL |
| image_public_id | VARCHAR(255) | Cloudinary public ID |
| status | ENUM | available / sold |
| created_at | TIMESTAMP | Listing date |
| updated_at | TIMESTAMP | Last update |

### favorites
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | User FK |
| product_id | INT | Product FK |
| created_at | TIMESTAMP | Time favorited |

### reviews
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| reviewer_id | INT | User FK (reviewer) |
| seller_id | INT | User FK (seller) |
| product_id | INT | Product FK |
| rating | TINYINT | 1-5 Stars |
| comment | TEXT | Review text |
| created_at | TIMESTAMP | Time created |
| updated_at | TIMESTAMP | Last update |

### product_images
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| product_id | INT | Product FK |
| image_url | VARCHAR(500) | Cloudinary URL |
| image_public_id | VARCHAR(255) | Cloudinary public ID |
| display_order | INT | Sort order in gallery |

### student_verifications
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | User FK |
| student_id_image_url | VARCHAR(500) | Uploaded ID image |
| student_id_public_id | VARCHAR(255) | Cloudinary public ID |
| university_name | VARCHAR(200) | University name |
| student_id_number | VARCHAR(100) | Student ID number |
| status | VARCHAR(20) | pending / approved / rejected |
| rejection_reason | TEXT | Reason if rejected |
| submitted_at | TIMESTAMP | Submission time |
| reviewed_at | TIMESTAMP | Review time |
