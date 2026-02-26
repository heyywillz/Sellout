const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const products = [
    {
        title: 'iPhone 13 Pro - 128GB Sierra Blue',
        description: 'Neatly used iPhone 13 Pro. Battery health 88%. Comes with original cable and a case. No scratches on screen.',
        category: 'Electronics',
        product_condition: 'Used',
        price: 8500.00,
        campus: 'Legon Campus',
        image_url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800',
        status: 'available'
    },
    {
        title: 'Engineering Mathematics by K.A. Stroud',
        description: '7th Edition. Essential for all engineering students. Slight highligting on first few pages but generally in good condition.',
        category: 'Books',
        product_condition: 'Fairly Used',
        price: 150.00,
        campus: 'KNUST',
        image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
        status: 'available'
    },
    {
        title: 'Nike Air Force 1 - White (Size 42)',
        description: 'Brand new in box. Never worn. Received as a gift but size was wrong. Original authentic Nikes.',
        category: 'Fashion',
        product_condition: 'New',
        price: 600.00,
        campus: 'UCC',
        image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        status: 'available'
    },
    {
        title: 'Wooden Study Desk and Chair',
        description: 'Sturdy wooden desk perfect for studying. Comes with a comfortable padded chair. Moving out so need it gone ASAP.',
        category: 'Furniture',
        product_condition: 'Used',
        price: 450.00,
        campus: 'Legon Campus',
        image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
        status: 'available'
    },
    {
        title: 'Introduction to Algorithms (CLRS)',
        description: 'The bible of computer science algorithms. Hardcover 3rd Edition. Completely new.',
        category: 'Books',
        product_condition: 'New',
        price: 400.00,
        campus: 'Ashesi',
        image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
        status: 'sold'
    },
    {
        title: 'Mini Fridge - Sharp 90L',
        description: 'Works perfectly. Froster is very cold. Ideal for hostel room. Cleaning it out before selling.',
        category: 'Furniture',
        product_condition: 'Used',
        price: 900.00,
        campus: 'UCC',
        image_url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',
        status: 'available'
    },
    {
        title: 'Anatomy Flashcards',
        description: 'Great for medical students. Complete set, none missing.',
        category: 'Books',
        product_condition: 'Fairly Used',
        price: 80.00,
        campus: 'UENR',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
        status: 'available'
    },
    {
        title: 'HP LaserJet Pro Printer',
        description: 'Black and white laser printer. Prints fast and clean. Toner still about 60%. Perfect for assignments and project work.',
        category: 'Electronics',
        product_condition: 'Used',
        price: 1200.00,
        campus: 'KNUST',
        image_url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800',
        status: 'available'
    },
    {
        title: 'Samsung Galaxy Tab S6 Lite',
        description: '10.4-inch display with S Pen included. Ideal for note-taking and watching lectures. Neatly used.',
        category: 'Electronics',
        product_condition: 'Fairly Used',
        price: 3200.00,
        campus: 'Legon Campus',
        image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
        status: 'available'
    },
    {
        title: 'Office Swivel Chair',
        description: 'Comfortable adjustable office chair with back support. Rolls smoothly. Great for long study hours.',
        category: 'Furniture',
        product_condition: 'Used',
        price: 350.00,
        campus: 'Ashesi',
        image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
        status: 'available'
    },
    {
        title: 'MacBook Air M1 (2020)',
        description: '8GB RAM, 256GB SSD. Extremely fast and battery lasts all day. Very clean with no dents.',
        category: 'Electronics',
        product_condition: 'Used',
        price: 7200.00,
        campus: 'UCC',
        image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
        status: 'available'
    },
    {
        title: 'Data Structures and Algorithms in Java',
        description: 'Comprehensive guide for CS students. Paperback. Few highlights inside.',
        category: 'Books',
        product_condition: 'Fairly Used',
        price: 200.00,
        campus: 'UENR',
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
        status: 'available'
    },
    {
        title: 'Adidas Backpack',
        description: 'Spacious and durable backpack. Multiple compartments for laptop and books.',
        category: 'Fashion',
        product_condition: 'Used',
        price: 180.00,
        campus: 'Legon Campus',
        image_url: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800',
        status: 'available'
    },
    {
        title: 'Standing Fan - Binatone',
        description: '16-inch standing fan. Very powerful with 3 speed levels. Works perfectly.',
        category: 'Others',
        product_condition: 'Used',
        price: 250.00,
        campus: 'KNUST',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
        status: 'available'
    },
    {
        title: 'Bed Frame (4x6)',
        description: 'Strong metal bed frame. No mattress included. Slight rust at the bottom but still sturdy.',
        category: 'Furniture',
        product_condition: 'Fairly Used',
        price: 500.00,
        campus: 'UCC',
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        status: 'available'
    },
    {
        title: 'Logitech Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver. Battery included.',
        category: 'Electronics',
        product_condition: 'New',
        price: 120.00,
        campus: 'Ashesi',
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
        status: 'available'
    },
    {
        title: 'Calculus Early Transcendentals by James Stewart',
        description: '8th Edition. Essential for engineering and science students. Good condition.',
        category: 'Books',
        product_condition: 'Used',
        price: 300.00,
        campus: 'UENR',
        image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
        status: 'available'
    }
];

const seed = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Seeding data...');

        // Create user 999 if not exists
        // Using upsert logic
        const hashedPassword = await bcrypt.hash('password123', 10);
        await connection.execute(
            `INSERT INTO users (id, name, email, password, campus, whatsapp, profile_image) 
             VALUES (999, 'Demo Seller', 'demo@sellout.gh', ?, 'Legon Campus', '+233501234567', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400')
             ON DUPLICATE KEY UPDATE name=name`,
            [hashedPassword]
        );

        console.log('User synced (ID: 999)');

        // Clear existing demo products (optional, but good for demo Reset)
        await connection.execute('DELETE FROM products WHERE user_id = 999');

        // Insert products
        for (const product of products) {
            await connection.execute(
                `INSERT INTO products (user_id, title, description, category, product_condition, price, campus, image_url, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    999,
                    product.title,
                    product.description,
                    product.category,
                    product.product_condition,
                    product.price,
                    product.campus,
                    product.image_url,
                    product.status
                ]
            );
        }

        console.log(`Successfully seeded ${products.length} products.`);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
};

seed();
