# Sellout - Campus Resale Marketplace Implementation Plan

## Project Overview
A full-stack web application for university students to buy and sell used items within their campus community.

## Tech Stack
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Backend**: Node.js (Express.js)
- **Database**: MySQL
- **Image Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure
```
Sellout/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── products.js
│   ├── utils/
│   │   └── helpers.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── profile.js
│   │   └── utils.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── product-details.html
│   ├── upload-product.html
│   └── edit-product.html
├── database/
│   └── schema.sql
└── README.md
```

## Implementation Phases

### Phase 1: Database Setup
- Create MySQL schema
- Define users and products tables

### Phase 2: Backend Foundation
- Initialize Node.js project
- Set up Express server
- Configure MySQL connection
- Configure Cloudinary

### Phase 3: Authentication System
- User registration with validation
- Password hashing with bcrypt
- JWT token generation
- **Google OAuth 2.0 Integration**:
    - Backend: verify Google token
    - Frontend: Google Sign-In button
- Login/logout functionality
- Protected routes middleware

### Phase 4: Product Management API
- CRUD operations for products
- Image upload to Cloudinary
- Campus-based filtering
- Search and filter functionality

### Phase 5: Frontend Development
- Responsive layout with Tailwind CSS
- Authentication pages
- Product listing with filters
- Product upload/edit forms
- Profile management
- WhatsApp integration

### Phase 6: Polish & UX
- Toast notifications
- Skeleton loaders
- Empty states
- Error handling
- Mobile optimization

### Phase 7: Enhanced Features (Implemented)
- **Wishlist/Favorites**:
    - Toggle favorite status
    - View favorite items page
- **Seller Reviews**:
    - Star ratings (1-5) and comments
    - Seller rating summary
    - Review moderation (delete own review)
- **Multi-Image Upload**:
    - Support for up to 5 images per product
    - Gallery view in product details
- **Testing & Bug Fixes**:
    - Comprehensive end-to-end testing
    - UI/UX refinements

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `POST /api/products` - Create new product (Multi-image)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Favorites
- `GET /api/favorites` - Get favorite items
- `POST /api/favorites/:id` - Toggle favorite

### Reviews
- `GET /api/reviews/seller/:id` - Get seller reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(100) | Unique email |
| password | VARCHAR(255) | Hashed password (Nullable) |
| google_id | VARCHAR(255) | Google OAuth ID |
| auth_provider | ENUM | local/google |
| campus | VARCHAR(100) | University/campus |
| whatsapp | VARCHAR(20) | WhatsApp number (Nullable) |
| profile_image | VARCHAR(500) | Cloudinary URL |
| created_at | TIMESTAMP | Account creation date |

### products
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| user_id | INT | Foreign key to users |
| title | VARCHAR(200) | Product title |
| description | TEXT | Product description |
| category | ENUM | Category type |
| condition | ENUM | Product condition |
| price | DECIMAL(10,2) | Price |
| campus | VARCHAR(100) | Campus location |
| image_url | VARCHAR(500) | Cloudinary URL |
| status | ENUM | available/sold |
| created_at | TIMESTAMP | Listing date |

### favorites
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | User FK |
| product_id | INT | Product FK |

### reviews
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| reviewer_id | INT | User FK |
| seller_id | INT | User FK |
| product_id | INT | Product FK |
| rating | TINYINT | 1-5 Stars |
| comment | TEXT | Review text |

### product_images
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| product_id | INT | Product FK |
| image_url | VARCHAR | Cloudinary URL |
| display_order | INT | Sort order |
