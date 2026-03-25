#  How to Run Sellout Locally

**Live Demo:** [https://sellout-campus.vercel.app](https://sellout-campus.vercel.app)

This guide provides step-by-step instructions on how to set up and run the **Sellout** application on your local machine.

##  Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)
- A **Cloudinary Account** (Free tier is sufficient for image uploads) - [Sign up here](https://cloudinary.com/)

---

##  Step 1: Clone the Repository

Open your terminal or command prompt and clone the project repository:

```bash
git clone <repository-url>
cd Sellout
```

---

##  Step 2: Database Setup

You need to set up the MySQL database and populate it with the initial schema and demo data.

1. Open your terminal or MySQL command-line client.
2. Log in to your MySQL server as the root user:
   ```bash
   mysql -u root -p
   ```
3. Run the complete schema file to create the database (`sellout_db`), all required tables, and seed data:
   ```bash
   source database/schema.sql;
   ```
   *(Alternatively, from your project root in a normal terminal window, run: `mysql -u root -p < database/schema.sql`)*

---

##  Step 3: Backend Setup

The backend is an API built with Node.js and Express.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder. You can use this template for local development:

   ```env
   PORT=5000
   NODE_ENV=development

   # Database Credentials
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=sellout_db

   # JWT Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Cloudinary (Required for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google OAuth (Optional for local testing)
   GOOGLE_CLIENT_ID=your_google_client_id

   # Frontend URL (To allow CORS requests)
   FRONTEND_URL=http://localhost:3000
   ```
   *Make sure to replace `your_mysql_password` and the Cloudinary credentials with your actual details.*

4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`, and you should see a message confirming the database connection.

---

##  Step 4: Frontend Setup

The frontend consists of static HTML, CSS, and JS files. It can be served using any simple static web server.

1. Open a **new terminal window** (leave the backend running).
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Start a local static server. You can use any of these options:

   **Option A: Using http-server (Recommended)**
   ```bash
   npx http-server -p 3000 -c-1
   ```

   **Option B: Using Python**
   ```bash
   python -m http.server 3000
   ```

   **Option C: Using Live Server (VS Code)**
   - Open the project in VS Code.--------
   - Install the "Live Server" extension.
   - Open `frontend/index.html`, right-click on the editor background, and select **"Open with Live Server"**.

4. Open your web browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

---

##  Step 5: Verify API Connection

By default, the frontend expects the backend API to be running on `http://localhost:5000/api`. 
If your backend is running on a different port, update the configuration in `frontend/js/config.js`:

```javascript
const CONFIG = {
    API_URL: 'http://localhost:5000/api', // Update this if your backend URL changes
};
```

---

##  You're All Set!

You can now test the full application. Try logging in, registering, or viewing products.
The seed data from Step 2 automatically provides some test products across various categories to interact with.

### Troubleshooting
- **Images not uploading?** Verify your Cloudinary credentials in `.env`.
- **"Network Error" on login/registration?** Make sure your backend server is running and the `FRONTEND_URL` in `.env` matches your static server's URL. You might also want to check `config.js` to ensure the correct path to the backend.
- **Database connection failed?** Verify `DB_PASSWORD` and `DB_USER` in `.env`. Ensure your MySQL database instance is actually running on your computer.
