-- Seed data for Sellout Marketplace Demo
USE sellout_db;

-- Insert a demo user if not exists (Password: password123)
INSERT INTO users (id, name, email, password, campus, whatsapp, profile_image) 
VALUES (999, 'Demo Seller', 'demo@sellout.gh', '$2a$10$X7.asbJkK2o5m5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e', 'Legon Campus', '+233501234567', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Products (Assigned to Demo User ID 999)
INSERT INTO products (user_id, title, description, category, product_condition, price, campus, image_url, status) VALUES
(999, 'iPhone 13 Pro - 128GB Sierra Blue', 'Neatly used iPhone 13 Pro. Battery health 88%. Comes with original cable and a case. No scratches on screen.', 'Electronics', 'Used', 8500.00, 'Legon Campus', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800', 'available'),

(999, 'Engineering Mathematics by K.A. Stroud', '7th Edition. Essential for all engineering students. Slight highligting on first few pages but generally in good condition.', 'Books', 'Fairly Used', 150.00, 'KNUST', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 'available'),

(999, 'Nike Air Force 1 - White (Size 42)', 'Brand new in box. Never worn. Received as a gift but size was wrong. Original authentic Nikes.', 'Fashion', 'New', 600.00, 'UCC', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', 'available'),

(999, 'Wooden Study Desk and Chair', 'Sturdy wooden desk perfect for studying. Comes with a comfortable padded chair. Moving out so need it gone ASAP.', 'Furniture', 'Used', 450.00, 'Legon Campus', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800', 'available'),

(999, 'Casio FX-991EX Classwiz Calculator', 'Brand new scientific calculator. Allowed in all exams. Solar powered.', 'Others', 'New', 220.00, 'KNUST', 'https://images.unsplash.com/photo-1587145820266-a5951ee1f620?w=800', 'available'),

(999, 'Dell XPS 13 Laptop', 'Core i7, 16GB RAM, 512GB SSD. Perfect for coding and assignments. Battery lasts about 6 hours. Few scratches on the lid.', 'Electronics', 'Fairly Used', 5500.00, 'Ashesi', 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800', 'available'),

(999, 'Vintage Blue Denim Jacket', 'Classic oversized denim jacket. Size M/L. Great condition.', 'Fashion', 'Used', 120.00, 'Legon Campus', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800', 'available'),

(999, 'Introduction to Algorithms (CLRS)', 'The bible of computer science algorithms. Hardcover 3rd Edition. Completely new.', 'Books', 'New', 400.00, 'Ashesi', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', 'sold'),

(999, 'Mini Fridge - Sharp 90L', 'Works perfectly. Froster is very cold. Ideal for hostel room. Cleaning it out before selling.', 'Furniture', 'Used', 900.00, 'UCC', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800', 'available'),

(999, 'Electric Kettle 2.0L', 'Fast boiling electric kettle. Stainless steel body. Brand new in box.', 'Others', 'New', 150.00, 'KNUST', 'https://images.unsplash.com/photo-1556910103-1c02745a80bf?w=800', 'available'),

(999, 'Sony WH-1000XM4 Noise Cancelling Headphones', 'Best in class noise cancellation. Used for 6 months. Pads are still soft. Comes with carrying case.', 'Electronics', 'Used', 2800.00, 'Legon Campus', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', 'available'),

(999, 'Anatomy Flashcards', 'Great for medical students. Complete set, none missing.', 'Books', 'Fairly Used', 80.00, 'Korle-Bu', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'available');
