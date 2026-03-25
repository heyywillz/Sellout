const mysql = require('mysql2/promise');
require('dotenv').config();

// Build SSL configuration for cloud databases (e.g., Aiven)
const sslConfig = process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: true, ca: process.env.DB_CA || undefined } }
    : {};

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sellout_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...sslConfig
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, testConnection };
