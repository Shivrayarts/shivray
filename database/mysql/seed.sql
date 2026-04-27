USE shivray_arts;

INSERT INTO users (full_name, email, password_hash, role, is_active)
VALUES
  (
    'Shivray Admin',
    'admin@shivray.local',
    SHA2('Admin@123', 256),
    'admin',
    1
  )
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  is_active = VALUES(is_active);

INSERT INTO products (
  slug,
  name,
  price,
  image_url,
  category,
  tag,
  short_description,
  details,
  material,
  dimensions,
  stock_quantity,
  is_published
)
VALUES
  (
    'shastradhari-maharaj-coloured',
    'Shastradhari Maharaj - Coloured',
    5100.00,
    '/assets/product-statue-1.jpg',
    'Statues',
    'Featured',
    'A vibrant handcrafted Maharaj idol with warrior detailing.',
    'A premium hand-finished statue crafted for collectors and devotees who value historical authenticity and intricate artistry.',
    'Resin with premium color finish',
    'Approx. 12 in height',
    12,
    1
  ),
  (
    'royal-khanjar-with-sheath',
    'Royal Khanjar with Sheath',
    8500.00,
    '/assets/product-weapon-1.jpg',
    'Weapons',
    'Popular',
    'Decorative khanjar set with ornate sheath and rich finish.',
    'An elegant collectible inspired by historic ceremonial daggers, balanced for visual appeal and detailed craftsmanship.',
    'Forged steel and decorative metalwork',
    'Approx. 16 in length',
    4,
    1
  ),
  (
    'brass-dhoop-stand',
    'Brass Dhoop Stand',
    2200.00,
    '/assets/product-dhoop-1.jpg',
    'Dhoop',
    'New',
    'Traditional brass incense stand for pooja and decor.',
    'A durable handcrafted dhoop stand combining devotional use with elegant heritage-inspired design.',
    'Solid brass',
    'Approx. 6 in height',
    7,
    1
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  price = VALUES(price),
  image_url = VALUES(image_url),
  category = VALUES(category),
  tag = VALUES(tag),
  short_description = VALUES(short_description),
  details = VALUES(details),
  material = VALUES(material),
  dimensions = VALUES(dimensions),
  stock_quantity = VALUES(stock_quantity),
  is_published = VALUES(is_published);

INSERT INTO catalogues (
  slug,
  title,
  short_label,
  description,
  image_url,
  item_count_label,
  sort_order,
  is_active
)
VALUES
  (
    'statues-catalogue',
    'Statue Catalogue',
    'Statues',
    'Maharaj statues, wall pieces, premium display idols, and gifting options.',
    '/assets/product-statue-1.jpg',
    '170 products',
    1,
    1
  ),
  (
    'weapons-catalogue',
    'Weapon Catalogue',
    'Weapons',
    'Talwar, khanjar, warrior weapons, ceremonial pieces, and display sets.',
    '/assets/product-weapon-1.jpg',
    '52 products',
    2,
    1
  ),
  (
    'shield-catalogue',
    'Shield Catalogue',
    'Shields',
    'Decor shields, premium heritage shields, and combo display collections.',
    '/assets/hero-banner-3.jpg',
    '18 products',
    3,
    1
  ),
  (
    'dhoop-catalogue',
    'Dhoop & Decor Catalogue',
    'Dhoop',
    'Dhoop stands, devotional decor, brass pieces, and pooja accessories.',
    '/assets/product-dhoop-1.jpg',
    '34 products',
    4,
    1
  ),
  (
    'full-catalogue',
    'Full Catalogue',
    'Full Range',
    'Complete Shivray range in one place for browsing, enquiry, and bulk selection.',
    '/assets/products-poster.jpg',
    'All collections',
    5,
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  short_label = VALUES(short_label),
  description = VALUES(description),
  image_url = VALUES(image_url),
  item_count_label = VALUES(item_count_label),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

