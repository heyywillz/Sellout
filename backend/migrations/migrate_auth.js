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

        console.log('Running auth migrations...\n');

        // 1. Add google_id column
        try {
            await connection.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL AFTER email");
            console.log("✅ Added google_id column");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ google_id column already exists");
            else throw e;
        }

        // 2. Add auth_provider column
        try {
            await connection.query("ALTER TABLE users ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local' AFTER google_id");
            console.log("✅ Added auth_provider column");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ auth_provider column already exists");
            else throw e;
        }

        // 3. Make password nullable
        try {
            await connection.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) DEFAULT NULL");
            console.log("✅ Made password nullable");
        } catch (e) {
            console.error("❌ Failed to modify password column:", e.message);
        }

        // 4. Make whatsapp nullable
        try {
            await connection.query("ALTER TABLE users MODIFY COLUMN whatsapp VARCHAR(20) DEFAULT NULL");
            console.log("✅ Made whatsapp nullable");
        } catch (e) {
            console.error("❌ Failed to modify whatsapp column:", e.message);
        }

        // 5. Add index for google_id
        try {
            await connection.query("ALTER TABLE users ADD INDEX idx_google_id (google_id)");
            console.log("✅ Added index for google_id");
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') console.log("ℹ️ Index for google_id already exists");
            else throw e;
        }

        console.log('\n🎉 Auth migrations completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
};

migrate();
