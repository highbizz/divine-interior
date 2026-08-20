-- ============================================================
-- Divine Interior — MySQL Schema
-- Import via phpMyAdmin or: mysql -u root -p divine_interior < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `divine_interior` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `divine_interior`;

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(120) NOT NULL,
  `email`      VARCHAR(191) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,          -- bcrypt hash
  `role`       ENUM('super_admin','admin','editor','viewer') NOT NULL DEFAULT 'editor',
  `avatar`     VARCHAR(512) DEFAULT NULL,
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default super-admin: admin@divine.com / Admin@1234
-- Password hash for "Admin@1234" (bcrypt cost 12)
INSERT IGNORE INTO `admin_users` (`name`,`email`,`password`,`role`) VALUES
('Super Admin','admin@divine.com','$2y$12$XKJnS5Tp3FjxLQv8mRe0O.NKmBhfxO6LzqvP5.WZMzjB1YbCfDyZm','super_admin');

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`            VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL UNIQUE,
  `description`      TEXT NOT NULL DEFAULT '',
  `price`            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `compare_at_price` DECIMAL(12,2) DEFAULT NULL,
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'INR',
  `category`         VARCHAR(120) NOT NULL DEFAULT '',
  `tags`             JSON NOT NULL DEFAULT ('[]'),
  `images`           JSON NOT NULL DEFAULT ('[]'),
  `stock`            INT NOT NULL DEFAULT 0,
  `sku`              VARCHAR(100) DEFAULT NULL,
  `is_active`        TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1) NOT NULL DEFAULT 0,
  `options`          JSON NOT NULL DEFAULT ('[]'),
  `variants`         JSON NOT NULL DEFAULT ('[]'),
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `customers` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`         VARCHAR(180) NOT NULL,
  `email`        VARCHAR(191) NOT NULL UNIQUE,
  `phone`        VARCHAR(30) DEFAULT NULL,
  `avatar`       VARCHAR(512) DEFAULT NULL,
  `addresses`    JSON NOT NULL DEFAULT ('[]'),
  `total_orders` INT NOT NULL DEFAULT 0,
  `total_spent`  DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `notes`        TEXT DEFAULT NULL,
  `tags`         JSON NOT NULL DEFAULT ('[]'),
  `is_active`    TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number`     VARCHAR(40) NOT NULL UNIQUE,
  `customer_id`      INT UNSIGNED DEFAULT NULL,
  `customer_name`    VARCHAR(180) NOT NULL,
  `customer_email`   VARCHAR(191) NOT NULL,
  `customer_phone`   VARCHAR(30) DEFAULT NULL,
  `shipping_address` JSON NOT NULL DEFAULT ('{}'),
  `items`            JSON NOT NULL DEFAULT ('[]'),
  `subtotal`         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `shipping_cost`    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount`         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total`            DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status`           ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_status`   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_method`   VARCHAR(60) DEFAULT NULL,
  `notes`            TEXT DEFAULT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- BLOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blogs` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`            VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL UNIQUE,
  `excerpt`          TEXT NOT NULL DEFAULT '',
  `content`          LONGTEXT NOT NULL DEFAULT '',
  `cover_image`      VARCHAR(512) DEFAULT NULL,
  `author`           VARCHAR(120) NOT NULL DEFAULT 'Admin',
  `tags`             JSON NOT NULL DEFAULT ('[]'),
  `status`           ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(512) DEFAULT NULL,
  `views`            INT NOT NULL DEFAULT 0,
  `published_at`     DATETIME DEFAULT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- SAMPLE DATA
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `products` (`title`,`slug`,`description`,`price`,`compare_at_price`,`category`,`tags`,`images`,`stock`,`sku`,`is_active`,`is_featured`) VALUES
('The Aurelia Velvet Sofa','aurelia-velvet-sofa','Indulge in plush comfort. Upholstered in premium cotton velvet with deep tufting and solid brass legs.',145000,175000,'Sofas & Couches','["featured","sale"]','["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"]',12,'DI-SOFA-001',1,1),
('Celeste Marble Coffee Table','celeste-marble-coffee-table','Crafted from hand-selected Italian Carrara marble with a minimalist geometric iron base.',68000,90000,'Coffee Tables','["featured"]','["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"]',5,'DI-TABLE-001',1,1),
('Helios Brass Pendant Light','helios-brass-pendant-light','Hand-brushed brass panels that reflect a warm golden glow. Ideal for dining spaces.',32500,45000,'Lighting','["featured"]','["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80"]',20,'DI-LIGHT-001',1,0),
('Kensington Oak Dining Chair','kensington-oak-dining-chair','Solid white oak with a hand-woven paper cord seat for ergonomic support.',18900,25000,'Dining Chairs','["sale"]','["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"]',30,'DI-CHAIR-001',1,0),
('Elysian Silk Cushions','elysian-silk-cushions','Spun from mulberry silk with a subtle sheen. Adds soft elegance to any arrangement.',6800,12000,'Accessories','["sale"]','["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"]',50,'DI-CUSH-001',1,0),
('Steelcase Manual Height Adjustable Table (Model 2/5)','steelcase-manual-table-2-5','Ergonomic manual height adjustable table by Steelcase. Features a heavy-duty crank height mechanism.',8800,18000,'Adjustable Desk','["featured","table","adjustable-desk","steelcase"]','["/products/SteelcaseManual25_1.png","/products/SteelcaseManual25_2.png","/products/SteelcaseManual25_3.png"]',8,'SC-MAN-TBL-25',1,1),
('Steelcase Manual Height Adjustable Table (155cm x 70cm)','steelcase-manual-table-155-70','Steelcase manual height adjustable table featuring a 155cm x 70cm surface. Min height 70cm, Max height 116cm.',9800,20000,'Adjustable Desk','["featured","table","adjustable-desk","steelcase"]','["/products/SteelcaseManual155_1.png","/products/SteelcaseManual155_2.png"]',6,'SC-MAN-TBL-155-70',1,1),
('Height Adjustable Electric Table 2-Step (150cm x 66cm)','height-adjustable-electric-table-2step-150-66','Height Adjustable Electric Table featuring a 2-step motorized lift mechanism. Size: 150cm x 66cm. Min height 68cm, Max height 105cm.',14000,28000,'Adjustable Desk','["featured","table","adjustable-desk","electric"]','["/products/ElectricTable2step1.png","/products/ElectricTable2step2.png","/products/ElectricTable2step3.png","/products/ElectricTable2step4.png"]',10,'HA-ELEC-TBL-2STEP-150',1,1),
('Height Adjustable Electric Table 3-Step (150cm x 66cm)','height-adjustable-electric-table-3step-150-66','Height Adjustable Electric Table featuring a 3-step motorized lift mechanism. Size: 150cm x 66cm. Min height 70cm, Max height 126cm.',16000,32000,'Adjustable Desk','["featured","table","adjustable-desk","electric"]','["/products/ElectricTable3step1.png","/products/ElectricTable3step2.png","/products/ElectricTable3step3.png"]',10,'HA-ELEC-TBL-3STEP-150',1,1);

INSERT IGNORE INTO `blogs` (`title`,`slug`,`excerpt`,`content`,`author`,`tags`,`status`,`cover_image`,`published_at`) VALUES
('The Art of Luxury Minimalism','art-of-luxury-minimalism','Discover how less can truly be more when it comes to high-end interior design.','<p>Luxury minimalism is not about stripping a space bare — it is about intentional curation of pieces that speak volumes through restraint.</p>','Divine Interior Team','["interior-design","minimalism","luxury"]','published','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',NOW()),
('Choosing the Perfect Statement Sofa','choosing-perfect-statement-sofa','A sofa is the centrepiece of any living room. Here is how to choose one that speaks to your style.','<p>When selecting a statement sofa, consider scale, fabric, and the overall design language of your space.</p>','Divine Interior Team','["sofas","buying-guide","furniture"]','published','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',DATE_SUB(NOW(), INTERVAL 7 DAY)),
('Marble in Modern Interiors','marble-in-modern-interiors','Natural stone has made a dramatic comeback. We explore how marble fits into contemporary homes.','<p>From Carrara white to Nero Marquina black, marble brings unmatched depth to any interior.</p>','Divine Interior Team','["marble","stone","trends"]','draft',NULL,NULL);

INSERT IGNORE INTO `customers` (`name`,`email`,`phone`,`addresses`,`total_orders`,`total_spent`,`tags`) VALUES
('Priya Sharma','priya.sharma@example.com','+91 98765 43210','[{"name":"Priya Sharma","line1":"12 Palm Grove","city":"Mumbai","state":"Maharashtra","postal_code":"400001","country":"India"}]',1,145000,'["vip"]'),
('Rahul Mehta','rahul.mehta@example.com','+91 87654 32109','[{"name":"Rahul Mehta","line1":"45 Brigade Road","city":"Bengaluru","state":"Karnataka","postal_code":"560001","country":"India"}]',1,82100,'[]'),
('Ananya Patel','ananya.patel@example.com',NULL,'[{"name":"Ananya Patel","line1":"78 Jodhpur Park","city":"Kolkata","state":"West Bengal","postal_code":"700068","country":"India"}]',1,60800,'[]');

INSERT IGNORE INTO `orders` (`order_number`,`customer_name`,`customer_email`,`customer_phone`,`shipping_address`,`items`,`subtotal`,`shipping_cost`,`discount`,`total`,`status`,`payment_status`,`payment_method`) VALUES
('DI-20240101-1001','Priya Sharma','priya.sharma@example.com','+91 98765 43210','{"name":"Priya Sharma","line1":"12 Palm Grove","city":"Mumbai","state":"Maharashtra","postal_code":"400001","country":"India"}','[{"id":"item-1","product_title":"The Aurelia Velvet Sofa","variant_title":"Emerald Green","price":145000,"quantity":1,"total":145000}]',145000,0,0,145000,'delivered','paid','UPI'),
('DI-20240115-1002','Rahul Mehta','rahul.mehta@example.com','+91 87654 32109','{"name":"Rahul Mehta","line1":"45 Brigade Road","city":"Bengaluru","state":"Karnataka","postal_code":"560001","country":"India"}','[{"id":"item-2","product_title":"Celeste Marble Coffee Table","variant_title":"Carrara Marble","price":68000,"quantity":1,"total":68000}]',68000,500,0,68500,'processing','paid','Credit Card'),
('DI-20240120-1003','Ananya Patel','ananya.patel@example.com',NULL,'{"name":"Ananya Patel","line1":"78 Jodhpur Park","city":"Kolkata","state":"West Bengal","postal_code":"700068","country":"India"}','[{"id":"item-3","product_title":"Helios Brass Pendant Light","variant_title":"Large","price":32500,"quantity":2,"total":65000}]',65000,800,5000,60800,'pending','pending',NULL);
