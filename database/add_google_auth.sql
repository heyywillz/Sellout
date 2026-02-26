-- Migration: Add Google OAuth support
-- Run this against your existing sellout_db

USE sellout_db;

-- Add google_id column for Google OAuth users
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL AFTER email;

-- Add auth_provider column to track how the user signed up
ALTER TABLE users ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local' AFTER google_id;

-- Make password nullable (Google users won't have a password)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) DEFAULT NULL;

-- Make whatsapp nullable (Google users will set it later)
ALTER TABLE users MODIFY COLUMN whatsapp VARCHAR(20) DEFAULT NULL;

-- Add index for Google ID lookups
ALTER TABLE users ADD INDEX idx_google_id (google_id);
