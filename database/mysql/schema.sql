-- Hostinger phpMyAdmin import:
-- 1. Create/select the `shivray_arts` database from phpMyAdmin first.
-- 2. Then import this file inside that selected database.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  phone VARCHAR(30) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(191) NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  final_price DECIMAL(10,2) DEFAULT NULL,
  image_url MEDIUMTEXT NOT NULL,
  category VARCHAR(191) NOT NULL,
  tag TEXT DEFAULT NULL,
  short_description TEXT NOT NULL,
  details TEXT NOT NULL,
  material TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  history_background TEXT DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category (category),
  KEY idx_products_sort (sort_order),
  CONSTRAINT fk_products_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalogues (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  short_label VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_url MEDIUMTEXT NOT NULL,
  item_count_label VARCHAR(60) DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_catalogues_slug (slug),
  KEY idx_catalogues_active (is_active),
  KEY idx_catalogues_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hero_banners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(191) NOT NULL,
  eyebrow VARCHAR(191) NOT NULL,
  title_top VARCHAR(191) NOT NULL,
  title_bottom VARCHAR(191) NOT NULL,
  copy_text TEXT NOT NULL,
  image_url MEDIUMTEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hero_banners_slug (slug),
  KEY idx_hero_banners_active (is_active),
  KEY idx_hero_banners_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS homepage_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_name VARCHAR(191) NOT NULL,
  review_text TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  location VARCHAR(120) DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_homepage_reviews_active (is_active),
  KEY idx_homepage_reviews_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS homepage_videos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  video_url MEDIUMTEXT NOT NULL,
  video_type ENUM('reel', 'youtube') NOT NULL DEFAULT 'youtube',
  thumbnail_url MEDIUMTEXT DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_homepage_videos_active (is_active),
  KEY idx_homepage_videos_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS homepage_settings (
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_no VARCHAR(30) NOT NULL,
  customer_id BIGINT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  customer_phone VARCHAR(30) DEFAULT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('Cash On Delivery', 'Online Payment') NOT NULL DEFAULT 'Cash On Delivery',
  payment_info VARCHAR(120) NOT NULL DEFAULT 'Cash On Delivery Pending',
  shipping_address TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_no (order_no),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED DEFAULT NULL,
  product_slug_snapshot VARCHAR(191) DEFAULT NULL,
  product_name_snapshot VARCHAR(191) NOT NULL,
  product_image_snapshot MEDIUMTEXT DEFAULT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  line_total DECIMAL(10,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  subject VARCHAR(191) DEFAULT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiries_status (status)
) ENGINE=InnoDB;

