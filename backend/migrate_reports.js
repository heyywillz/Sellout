const { pool } = require('./config/database');

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reporter_id INT NOT NULL,
                product_id INT NOT NULL,
                reason ENUM('scam', 'inappropriate', 'duplicate', 'wrong_category', 'misleading', 'other') NOT NULL,
                details TEXT DEFAULT NULL,
                status ENUM('pending', 'reviewed', 'dismissed') DEFAULT 'pending',
                admin_note TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_report (reporter_id, product_id),
                INDEX idx_product_id (product_id),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ product_reports table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
