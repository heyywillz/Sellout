const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Running migrations for new features...\n');

        // 1. Favorites / Wishlist table
        console.log('Creating favorites table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_favorite (user_id, product_id),
                INDEX idx_user_id (user_id),
                INDEX idx_product_id (product_id)
            )
        `);
        console.log('✅ favorites table ready');

        // 2. Reviews / Seller Ratings table
        console.log('Creating reviews table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reviewer_id INT NOT NULL,
                seller_id INT NOT NULL,
                product_id INT NOT NULL,
                rating TINYINT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (reviewer_id, product_id),
                INDEX idx_seller_id (seller_id),
                INDEX idx_product_id (product_id)
            )
        `);
        console.log('✅ reviews table ready');

        // 3. Product Images table (multiple images per product)
        console.log('Creating product_images table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                image_public_id VARCHAR(255) DEFAULT NULL,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product_id (product_id)
            )
        `);
        console.log('✅ product_images table ready');

        console.log('\n🎉 All migrations completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
};

migrate();
