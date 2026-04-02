const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const products = [
    {
        "title": "Apple AirPods Max Silver",
        "description": "The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.",
        "category": "Electronics",
        "product_condition": "Used",
        "price": "6599.88",
        "campus": "KNUST",
        "image_url": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp"
    },
    {
        "title": "Apple iPhone Charger",
        "description": "The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.",
        "category": "Electronics",
        "product_condition": "New",
        "price": "239.88",
        "campus": "KNUST",
        "image_url": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp"
    },
    {
        "title": "Apple MagSafe Battery Pack",
        "description": "The Apple MagSafe Battery Pack is a portable and convenient way to add extra battery life to your MagSafe-compatible iPhone. Attach it magnetically for a secure connection.",
        "category": "Electronics",
        "product_condition": "Fairly Used",
        "price": "1199.88",
        "campus": "UENR",
        "image_url": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp"
    },
    {
        "title": "Beats Flex Wireless Earphones",
        "description": "The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.",
        "category": "Electronics",
        "product_condition": "Used",
        "price": "599.88",
        "campus": "UENR",
        "image_url": "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp"
    },
    {
        "title": "Apple MacBook Pro 14 Inch Space Grey",
        "description": "The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple's M1 Pro chip for exceptional performance and a stunning Retina display.",
        "category": "Electronics",
        "product_condition": "Fairly Used",
        "price": "23999.88",
        "campus": "Ashesi",
        "image_url": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"
    },
    {
        "title": "Asus Zenbook Pro Dual Screen Laptop",
        "description": "The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.",
        "category": "Electronics",
        "product_condition": "New",
        "price": "21599.88",
        "campus": "KNUST",
        "image_url": "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp"
    },
    {
        "title": "Huawei Matebook X Pro",
        "description": "The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.",
        "category": "Electronics",
        "product_condition": "Fairly Used",
        "price": "16799.88",
        "campus": "Korle-Bu",
        "image_url": "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp"
    },
    {
        "title": "Lenovo Yoga 920",
        "description": "The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.",
        "category": "Electronics",
        "product_condition": "Fairly Used",
        "price": "13199.88",
        "campus": "UENR",
        "image_url": "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp"
    },
    {
        "title": "Calvin Klein Heel Shoes",
        "description": "Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.",
        "category": "Fashion",
        "product_condition": "New",
        "price": "959.88",
        "campus": "Legon Campus",
        "image_url": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp"
    },
    {
        "title": "Golden Shoes Woman",
        "description": "The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.",
        "category": "Fashion",
        "product_condition": "Used",
        "price": "599.88",
        "campus": "Legon Campus",
        "image_url": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp"
    },
    {
        "title": "Pampi Shoes",
        "description": "Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.",
        "category": "Fashion",
        "product_condition": "Used",
        "price": "359.88",
        "campus": "KNUST",
        "image_url": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp"
    },
    {
        "title": "Red Shoes",
        "description": "The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.",
        "category": "Fashion",
        "product_condition": "New",
        "price": "419.88",
        "campus": "UENR",
        "image_url": "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/thumbnail.webp"
    },
    {
        "title": "Blue & Black Check Shirt",
        "description": "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
        "category": "Fashion",
        "product_condition": "Used",
        "price": "359.88",
        "campus": "UENR",
        "image_url": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp"
    },
    {
        "title": "Gigabyte Aorus Men Tshirt",
        "description": "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
        "category": "Fashion",
        "product_condition": "Fairly Used",
        "price": "299.88",
        "campus": "Ashesi",
        "image_url": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"
    },
    {
        "title": "Man Plaid Shirt",
        "description": "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
        "category": "Fashion",
        "product_condition": "New",
        "price": "419.88",
        "campus": "UCC",
        "image_url": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp"
    },
    {
        "title": "Man Short Sleeve Shirt",
        "description": "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
        "category": "Fashion",
        "product_condition": "Used",
        "price": "239.88",
        "campus": "Legon Campus",
        "image_url": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp"
    },
    {
        "title": "Annibale Colombo Bed",
        "description": "The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials for a comfortable and stylish bedroom.",
        "category": "Furniture",
        "product_condition": "Used",
        "price": "2200.00",
        "campus": "Korle-Bu",
        "image_url": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
    },
    {
        "title": "Annibale Colombo Sofa",
        "description": "The Annibale Colombo Sofa is a sophisticated and comfortable seating option.",
        "category": "Furniture",
        "product_condition": "Fairly Used",
        "price": "3000.00",
        "campus": "KNUST",
        "image_url": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
    },
    {
        "title": "Bedside Table African Cherry",
        "description": "Stylish and functional addition to your bedroom.",
        "category": "Furniture",
        "product_condition": "Fairly Used",
        "price": "350.00",
        "campus": "Korle-Bu",
        "image_url": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
    },
    {
        "title": "Knoll Saarinen Chair",
        "description": "Modern and ergonomic chair, perfect for your office.",
        "category": "Furniture",
        "product_condition": "New",
        "price": "600.00",
        "campus": "Legon Campus",
        "image_url": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"
    }
];

const seed = async () => {
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
                rejectUnauthorized: false
            }
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
