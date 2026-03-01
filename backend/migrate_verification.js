const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });

        console.log('Running verification migrations...\n');

        // 1. Add is_verified column to users
        try {
            await connection.query("ALTER TABLE users ADD COLUMN is_verified ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'unverified'");
            console.log("✅ Added is_verified column to users");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ is_verified column already exists");
            else throw e;
        }

        // 2. Add is_admin column to users
        try {
            await connection.query("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0");
            console.log("✅ Added is_admin column to users");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ is_admin column already exists");
            else throw e;
        }

        // 3. Create student_verifications table
        console.log('Creating student_verifications table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS student_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                student_id_image_url VARCHAR(500) NOT NULL,
                student_id_public_id VARCHAR(255) DEFAULT NULL,
                university_name VARCHAR(200),
                student_id_number VARCHAR(100),
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                rejection_reason TEXT DEFAULT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ student_verifications table ready');

        console.log('\n🎉 Verification migrations completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
};

migrate();
