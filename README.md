# Sellout - Campus Resale Marketplace

A full-stack web application for university students to buy and sell used items within their campus community.

![Sellout](https://via.placeholder.com/800x400?text=Sellout+Campus+Marketplace)

## 🌟 Features

- **User Authentication**: Secure registration and login with local JWT or **Google Sign-In**
- **Product Management**: Create, read, update, and delete product listings
- **Multi-Image Upload**: Support for up to 5 images per product
- **Wishlist/Favorites**: Save items for later and view them in a dedicated page
- **Seller Reviews**: Rate and review sellers to build trust
- **Search & Filtering**: Find items by category, condition, campus, and price
- **WhatsApp Integration**: Direct buyer-seller communication via WhatsApp
- **Campus-Based**: Filter listings by university/campus
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode UI**: Modern, sleek dark theme interface

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs for password hashing
- Cloudinary for image storage (Multi-image support)

## 📁 Project Structure

```
Sellout/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── favoriteController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── favorites.js
│   │   └── reviews.js
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   └── migrate.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── products.js
│   │   └── utils.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── product-details.html
│   ├── upload-product.html
│   ├── edit-product.html
│   └── favorites.html
└── database/
    └── schema.sql
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- Cloudinary Account (free tier works)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Sellout
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE sellout_db;
```

2. Run the schema:
```bash
mysql -u root -p sellout_db < database/schema.sql
```

Or manually execute the SQL in `database/schema.sql`

3. (Optional) Run Migrations for new features:
```bash
cd backend
node migrate.js
```

### 3. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sellout_db

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id

FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### 4. Frontend Setup

The frontend is static HTML and can be served by any web server.

**Option A: Using Live Server (VS Code)**
1. Install "Live Server" extension in VS Code
2. Open `frontend/index.html`
3. Click "Go Live" in the bottom right

**Option B: Using Python**
```bash
cd frontend
python -m http.server 3000
```

**Option C: Using Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

Then open `http://localhost:3000` in your browser.

### 5. Configure Frontend API URL

Update `frontend/js/config.js` if your backend runs on a different URL:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:5000/api',
    // ...
};
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |
| GET | `/api/users/products` | Get user's products |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
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
| POST | `/api/favorites/:id` | Toggle favorite (add/remove) |
| GET | `/api/favorites/check/:id` | Check if product is favored |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/seller/:id` | Get reviews for a seller |
| POST | `/api/reviews` | Create a review (auth) |
| DELETE | `/api/reviews/:id` | Delete a review (auth) |
| GET | `/api/reviews/rating/:id` | Get seller rating summary |

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation & sanitization
- Protected API routes
- Rate limiting
- Image upload validation

## 📱 WhatsApp Integration

When a buyer clicks "Contact Seller", they're redirected to WhatsApp with a pre-filled message:

```
Hello, I'm interested in your item "HP Laptop" listed on Sellout for ₵50,000. Is it still available?
```

## 🎨 UI Features

- Dark mode theme
- Glassmorphism effects
- Skeleton loading states
- Toast notifications
- Empty states
- Responsive grid layouts
- Smooth animations
- Category icons

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

### Database (PlanetScale/Railway)
1. Create MySQL database
2. Run schema.sql
3. Update backend .env with connection string

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For questions or support, open an issue in the repository.


---

## 🧪 Demo Data

To populate the database with demo products, run:
```bash
cd backend
node seed.js
```

**Demo Account Credentials:**
- Email: `demo@sellout.gh`
- Password: `password123`

