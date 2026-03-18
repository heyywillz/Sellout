# Sellout - Campus Resale Marketplace

A full-stack web application for university students to buy and sell used items within their campus community. Built with Node.js, Express, MySQL, and vanilla JavaScript.

## 🌟 Features

- **User Authentication**: Secure registration and login with local JWT or **Google Sign-In**
- **Product Management**: Create, read, update, and delete product listings
- **Multi-Image Upload**: Support for up to 5 images per product with gallery view
- **Wishlist/Favorites**: Save items for later and view them in a dedicated page
- **Seller Reviews**: Rate and review sellers with star ratings (1-5) to build trust
- **Student Verification**: Submit student ID for admin-reviewed identity verification
- **Admin Dashboard**: Comprehensive admin panel with 6 tabs:
  - **Overview** with platform stats, charts, and health metrics
  - **Users** management with search, filter, and detail drawer
  - **Products** moderation with search, filter, delete, and pagination
  - **Verifications** queue with pending badge and approve/reject workflow
  - **Reports** management for flagged listings with resolve actions
  - **Campus Analytics** with per-campus breakdowns
- **CSV Data Export**: Export users and products tables to CSV files
- **Dark Mode**: Full dark mode toggle with theme persistence and dark-aware charts
- **Search & Filtering**: Full-text search, category, condition, campus, and price range filters
- **WhatsApp Integration**: Direct buyer-seller communication via WhatsApp
- **Campus-Based**: Filter listings by university/campus
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Modern UI**: Clean white-dominant design with green accents, smooth animations, and animated stat counters

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- MySQL 8.0
- JWT Authentication
- Google OAuth 2.0
- bcryptjs (password hashing)
- Cloudinary (image storage)
- express-validator (input validation)
- express-rate-limit (API rate limiting)

## 📁 Project Structure

```
Sellout/
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── cloudinary.js        # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── userController.js    # Profile management
│   │   ├── productController.js # Product CRUD
│   │   ├── favoriteController.js # Wishlist
│   │   ├── reviewController.js  # Seller reviews
│   │   ├── verificationController.js # Student verification
│   │   ├── reportController.js  # Product reports
│   │   └── adminController.js   # Admin dashboard
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   ├── admin.js             # Admin check
│   │   └── upload.js            # File upload
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── favorites.js
│   │   ├── reviews.js
│   │   ├── verification.js
│   │   ├── reports.js
│   │   └── admin.js
│   ├── .env                     # Environment variables
│   ├── server.js                # App entry point
│   ├── seed.js                  # Demo data seeder
│   └── package.json
├── frontend/
│   ├── assets/                  # Logo & images
│   ├── css/
│   │   ├── style.css            # Custom styles
│   │   └── dark-mode.css        # Dark mode theme overrides
│   ├── js/
│   │   ├── api.js               # HTTP client
│   │   ├── app.js               # Main init
│   │   ├── auth.js              # Auth management
│   │   ├── config.js            # API configuration
│   │   ├── products.js          # Product logic
│   │   ├── theme.js             # Dark mode toggle
│   │   └── utils.js             # Helpers
│   ├── index.html               # Homepage
│   ├── login.html               # Login
│   ├── register.html            # Registration
│   ├── profile.html             # User profile
│   ├── product-details.html     # Product details
│   ├── upload-product.html      # List new item
│   ├── edit-product.html        # Edit listing
│   ├── favorites.html           # Wishlist
│   ├── seller.html              # Seller profile
│   └── admin.html               # Admin dashboard
├── database/
│   └── schema.sql               # Complete DB schema
├── PROPOSAL.md
├── IMPLEMENTATION_PLAN.md
├── DOCUMENTATION.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8.0+)
- Cloudinary Account (free tier works)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Sellout
```

### 2. Database Setup

Run the single schema file to create the database, all tables, and seed data:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `sellout_db` database with 7 tables and 12 sample product listings.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with your credentials:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sellout_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Frontend
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### 4. Frontend Setup

The frontend is static HTML/CSS/JS and can be served by any web server.

**Option A: Using http-server (Recommended)**
```bash
cd frontend
npx http-server -p 3000 -c-1
```

**Option B: Using Python**
```bash
cd frontend
python -m http.server 3000
```

**Option C: Using Live Server (VS Code)**
1. Install "Live Server" extension
2. Open `frontend/index.html`
3. Click "Go Live"

Then open `http://localhost:3000` in your browser.

### 5. Configure Frontend API URL

If your backend runs on a different URL, update `frontend/js/config.js`:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:5000/api',
};
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |
| GET | `/api/users/products` | Get user's products |
| GET | `/api/users/:id` | Get public seller profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (auth, multi-image) |
| PUT | `/api/products/:id` | Update product (auth) |
| DELETE | `/api/products/:id` | Delete product (auth) |
| PUT | `/api/products/:id/sold` | Mark as sold (auth) |
| GET | `/api/products/campuses` | Get all campuses |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | Get user's favorites |
| POST | `/api/favorites/:id` | Toggle favorite |
| GET | `/api/favorites/check/:id` | Check if favorited |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/seller/:id` | Get seller reviews |
| POST | `/api/reviews` | Create review (auth) |
| DELETE | `/api/reviews/:id` | Delete review (auth) |
| GET | `/api/reviews/rating/:id` | Get rating summary |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verification/submit` | Submit student ID (auth) |
| GET | `/api/verification/status` | Check verification status (auth) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/verifications` | Get pending verifications |
| PUT | `/api/admin/verifications/:id/review` | Approve/reject verification |
| GET | `/api/admin/stats` | Platform statistics + health metrics |
| GET | `/api/admin/users` | List users with search/filter/sort |
| GET | `/api/admin/users/:id/details` | Full user profile (listings, reviews, verification) |
| PUT | `/api/admin/users/:id/toggle-admin` | Promote/demote admin |
| GET | `/api/admin/products` | List products with search/filter/pagination |
| DELETE | `/api/admin/products/:id` | Delete product (admin moderation) |
| GET | `/api/admin/campus-analytics` | Campus-level statistics |

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Google OAuth 2.0
- Input validation & sanitization (express-validator)
- Protected API routes
- Admin-only routes
- Rate limiting (express-rate-limit)
- Image upload validation
- CORS policy enforcement

## 📱 WhatsApp Integration

When a buyer clicks "Contact Seller", they're redirected to WhatsApp with a pre-filled message:

```
Hello, I'm interested in your item "iPhone 13 Pro" listed on Sellout for ₵8,500. Is it still available?
```

## 🎨 UI Features

- Clean white-dominant theme with green accents
- **Dark mode** with full theme toggle and localStorage persistence
- Dark-mode-aware Chart.js charts (adaptive grid, labels, borders)
- Animated hero section with floating student images
- **Animated stat counters** with eased count-up animation
- Skeleton loading states
- Toast notifications
- Empty states
- Responsive grid layouts
- Smooth CSS animations & micro-interactions
- Category icons with hover effects
- Star rating input with RTL direction trick
- User detail slide-out drawer with full profile, listings, and reviews

## 🌐 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push frontend code to GitHub
2. Connect to Vercel/Netlify
3. Deploy (no build step needed)
4. Update `js/config.js` with production API URL

### Database (PlanetScale/Railway)
1. Create MySQL database
2. Run `database/schema.sql`
3. Update backend `.env` with connection credentials

## 📝 License

© 2026 SellOut. Built for students.

---

## 🧪 Demo Data

The `database/schema.sql` file includes seed data with a demo user and 12 sample products across all categories. Simply run the schema file to populate the database:

```bash
mysql -u root -p < database/schema.sql
```
