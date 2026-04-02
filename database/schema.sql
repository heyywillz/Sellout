-- =============================================
-- Sellout Campus Resale Marketplace
-- Complete Database Schema
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS sellout_db;
USE sellout_db;

-- =============================================
-- Users table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    google_id VARCHAR(255) DEFAULT NULL,
    auth_provider ENUM('local', 'google') DEFAULT 'local',
    password VARCHAR(255) DEFAULT NULL,
    campus VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20) DEFAULT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    is_verified VARCHAR(20) DEFAULT 'unverified',
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_campus (campus),
    INDEX idx_google_id (google_id)
);

-- =============================================
-- Products table
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('Books', 'Electronics', 'Fashion', 'Furniture', 'Others') NOT NULL,
    product_condition ENUM('New', 'Fairly Used', 'Used') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    campus VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255) DEFAULT NULL,
    status ENUM('available', 'sold') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_campus (campus),
    INDEX idx_status (status),
    INDEX idx_price (price),
    FULLTEXT INDEX idx_search (title, description)
);

-- =============================================
-- Favorites / Wishlist table
-- =============================================
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
);

-- =============================================
-- Reviews / Seller Ratings table
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    seller_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (reviewer_id, product_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_product_id (product_id)
);

-- =============================================
-- Product Images table (multiple images per product)
-- =============================================
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255) DEFAULT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

-- =============================================
-- Student Verifications table
-- =============================================
CREATE TABLE IF NOT EXISTS student_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_id_image_url VARCHAR(500) NOT NULL,
    student_id_public_id VARCHAR(255) DEFAULT NULL,
    university_name VARCHAR(200) NOT NULL,
    student_id_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- =============================================
-- Product Reports table (flagging system)
-- =============================================
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
);

-- =============================================
-- Seed Data (Demo user and sample products)
-- =============================================
INSERT INTO users (id, name, email, password, campus, whatsapp, profile_image, is_admin)
VALUES (999, 'Admin(Willz)', 'admin@sellout.gh', '$2a$10$Dp7i8y1dDRdLB.XgGe/wUe1B/VpC5udTFOgGTCHkMGrz..mm6PRT.', 'UENR Campus', '+233547793444', 'http://localhost:3000/assets/admin.png', 1)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO products (user_id, title, description, category, product_condition, price, campus, image_url, status) VALUES
(999, 'iPhone 13 Pro - 128GB Sierra Blue', 'Neatly used iPhone 13 Pro. Battery health 88%. Comes with original cable and a case. No scratches on screen.', 'Electronics', 'Used', 8500.00, 'Legon Campus', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800', 'available'),
(999, 'Engineering Mathematics by K.A. Stroud', '7th Edition. Essential for all engineering students. Slight highligting on first few pages but generally in good condition.', 'Books', 'Fairly Used', 150.00, 'KNUST', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 'available'),
(999, 'Nike Air Force 1 - White (Size 42)', 'Brand new in box. Never worn. Received as a gift but size was wrong. Original authentic Nikes.', 'Fashion', 'New', 600.00, 'UCC', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', 'available'),
(999, 'Wooden Study Desk and Chair', 'Sturdy wooden desk perfect for studying. Comes with a comfortable padded chair. Moving out so need it gone ASAP.', 'Furniture', 'Used', 450.00, 'Legon Campus', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800', 'available'),
(999, 'Casio FX-991EX Classwiz Calculator', 'Brand new scientific calculator. Allowed in all exams. Solar powered.', 'Others', 'New', 220.00, 'KNUST', 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800', 'available'),
(999, 'Dell XPS 13 Laptop', 'Core i7, 16GB RAM, 512GB SSD. Perfect for coding and assignments. Battery lasts about 6 hours. Few scratches on the lid.', 'Electronics', 'Fairly Used', 5500.00, 'Ashesi', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'available'),
(999, 'Vintage Blue Denim Jacket', 'Classic oversized denim jacket. Size M/L. Great condition.', 'Fashion', 'Used', 120.00, 'Legon Campus', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800', 'available'),
(999, 'Introduction to Algorithms (CLRS)', 'The bible of computer science algorithms. Hardcover 3rd Edition. Completely new.', 'Books', 'New', 400.00, 'Ashesi', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', 'sold'),
(999, 'Mini Fridge - Sharp 90L', 'Works perfectly. Froster is very cold. Ideal for hostel room. Cleaning it out before selling.', 'Furniture', 'Used', 900.00, 'UCC', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800', 'available'),
(999, 'Electric Kettle 2.0L', 'Fast boiling electric kettle. Stainless steel body. Brand new in box.', 'Others', 'New', 150.00, 'KNUST', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', 'available'),
(999, 'Sony WH-1000XM4 Noise Cancelling Headphones', 'Best in class noise cancellation. Used for 6 months. Pads are still soft. Comes with carrying case.', 'Electronics', 'Used', 2800.00, 'Legon Campus', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', 'available'),
(999, 'Anatomy Flashcards', 'Great for medical students. Complete set, none missing.', 'Books', 'Fairly Used', 80.00, 'Korle-Bu', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'available'),
(999, 'HP LaserJet Pro Printer', 'Black and white laser printer. Prints fast and clean. Toner still about 60%. Perfect for assignments and project work.', 'Electronics', 'Used', 1200.00, 'KNUST', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800', 'available'),
(999, 'MacBook Air M1 (2020)', '8GB RAM, 256GB SSD. Extremely fast and battery lasts all day. Very clean with no dents.', 'Electronics', 'Used', 7200.00, 'UCC', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800', 'available'),
(999, 'Data Structures and Algorithms in Java', 'Comprehensive guide for CS students. Paperback. Few highlights inside.', 'Books', 'Fairly Used', 200.00, 'UENR', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 'available'),
(999, 'Standing Fan - Binatone', '16-inch standing fan. Very powerful with 3 speed levels. Works perfectly.', 'Others', 'Used', 250.00, 'KNUST', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'available'),
(999, 'Bed Frame (4x6)', 'Strong metal bed frame. No mattress included. Slight rust at the bottom but still sturdy.', 'Furniture', 'Fairly Used', 500.00, 'UCC', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 'available'),
(999, 'Office Swivel Chair', 'Comfortable adjustable office chair with back support. Rolls smoothly. Great for long study hours.', 'Furniture', 'Used', 350.00, 'Ashesi', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', 'available'),
(999, 'Logitech Wireless Mouse', 'Ergonomic wireless mouse with USB receiver. Battery included.', 'Electronics', 'New', 120.00, 'Ashesi', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 'available'),
(999, 'Adidas Ultraboost 22', 'Brand new in box, received as a gift but already have similar ones. Size 43, perfect for jogging and casual wear.', 'Fashion', 'New', 850.00, 'KNUST', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', 'available');
