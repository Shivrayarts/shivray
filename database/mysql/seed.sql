-- Import this file after selecting the `shivray_arts` database in phpMyAdmin.

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
  sort_order,
  stock_quantity,
  is_published
)
VALUES
  (
    'shastradhari-maharaj-coloured',
    'Shastradhari Maharaj - Coloured',
    12500.00,
    '/assets/product-statue-1.jpg',
    'Statues',
    'Featured',
    'A vibrant handcrafted Maharaj idol with warrior detailing.',
    'A premium hand-finished statue crafted for collectors and devotees who value historical authenticity and intricate artistry.',
    'Resin with premium color finish',
    'Approx. 12 in height',
    1,
    12,
    1
  ),
  (
    'ashwarudh-maharaj',
    'Ashwarudh maharaj',
    12850.00,
    '/assets/product-statue-2.jpeg',
    'Statues',
    'Featured',
    'Mounted Maharaj sculpture with regal posture and detail.',
    'This heroic composition captures leadership and bravery, ideal for display in homes, offices, and heritage-themed spaces.',
    'Metal-resin composite',
    'Approx. 18 in height',
    2,
    8,
    1
  ),
  (
    'roudra-shambhu-chatrapati',
    'Roudra shambhu chatrapati',
    12600.00,
    '/assets/product-statue-3.jpeg',
    'Statues',
    '',
    'Powerful artistic representation inspired by Maratha valor.',
    'Designed with sharp silhouette and expressive craftsmanship to celebrate the spirit of Chhatrapati-era heritage.',
    'Resin',
    'Approx. 12 in height',
    3,
    10,
    1
  ),
  (
    'royal-khanjar-with-sheath',
    'Royal Khanjar with Sheath',
    13200.00,
    '/assets/product-weapon-1.jpeg',
    'Weapons',
    'Popular',
    'Decorative khanjar set with ornate sheath and rich finish.',
    'An elegant collectible inspired by historic ceremonial daggers, balanced for visual appeal and detailed craftsmanship.',
    'Forged steel and decorative metalwork',
    'Approx. 16 in length',
    4,
    4,
    1
  ),
  (
    'vita-battle-axe',
    'Vita (battle axe)',
    12800.00,
    '/assets/product-weapon-2.jpeg',
    'Weapons',
    '',
    'Traditional battle-axe replica with warrior-era styling.',
    'A handcrafted showpiece celebrating battlefield aesthetics, made for historical decor and gifting collections.',
    'Steel head with wooden handle',
    'Approx. 24 in length',
    5,
    6,
    1
  ),
  (
    'ceremonial-gada',
    'Ceremonial gada',
    13400.00,
    '/assets/product-weapon-3.jpeg',
    'Weapons',
    'New',
    'Royal ceremonial mace with engraved design language.',
    'Crafted to evoke strength and heritage, this gada is a centerpiece artifact for premium cultural interiors.',
    'Brass and steel blend',
    'Approx. 30 in length',
    6,
    5,
    1
  ),
  (
    'brass-dhoop-stand',
    'Brass Dhoop Stand',
    12100.00,
    '/assets/product-dhoop-1.jpg',
    'Dhoop',
    'New',
    'Traditional brass incense stand for pooja and decor.',
    'A durable handcrafted dhoop stand combining devotional use with elegant heritage-inspired design.',
    'Solid brass',
    'Approx. 6 in height',
    7,
    7,
    1
  ),
  (
    'maratha-war-shield',
    'Maratha war shield',
    12900.00,
    '/assets/product-shield-1.jpg',
    'Shields',
    '',
    'Historical style shield replica with rugged detailing.',
    'Designed for display and themed environments, this shield reflects traditional defensive armory motifs.',
    'Wood and metal accents',
    'Approx. 20 in diameter',
    8,
    5,
    1
  ),
  (
    'talwar-curved-sword',
    'Talwar - curved sword',
    13600.00,
    '/assets/product-talwar-1.jpeg',
    'Weapons',
    'Featured',
    'Classic curved talwar inspired by Maratha battle tradition.',
    'A statement piece made with attention to blade profile, grip detail, and ceremonial display aesthetics.',
    'Steel blade with crafted hilt',
    'Approx. 34 in length',
    9,
    5,
    1
  ),
  (
    'saffron-straight-sword',
    'Saffron straight sword',
    12700.00,
    '/assets/product-2-Cpp2Ti8D.jpeg',
    'Weapons',
    'New',
    'Straight ceremonial sword with a saffron blade finish and display-ready profile.',
    'A heritage-inspired sword crafted for decorative walls, collector displays, and premium gifting sets.',
    'Steel blade with finished hilt',
    'Approx. 30 in length',
    10,
    6,
    1
  ),
  (
    'black-curved-talwar',
    'Black curved talwar',
    13100.00,
    '/assets/product-3-C820CibQ.jpeg',
    'Weapons',
    'New',
    'Curved talwar design with dark finish and traditional warrior silhouette.',
    'Built for heritage-themed interiors, this decorative talwar balances classic curve styling with a strong display presence.',
    'Forged steel with decorative grip',
    'Approx. 31 in length',
    11,
    6,
    1
  ),
  (
    'decorated-talwar-with-sheath',
    'Decorated talwar with sheath',
    13800.00,
    '/assets/product-4-CiEPJh0Z.jpeg',
    'Weapons',
    'Featured',
    'Curved display talwar paired with a decorated sheath for ceremonial presentation.',
    'Designed as a premium wall or showcase piece, this set combines vibrant sheath work with a heritage weapon form.',
    'Steel blade, carved grip, decorative sheath',
    'Approx. 32 in length',
    12,
    4,
    1
  ),
  (
    'royal-straight-blade',
    'Royal straight blade',
    13300.00,
    '/assets/product-5-DHYO5lNW.jpeg',
    'Weapons',
    'Popular',
    'Long straight blade with ornate hilt detailing and a regal display look.',
    'A statement sword for collectors who want a cleaner blade line while keeping the premium Shivray presentation style.',
    'Steel blade with engraved hilt accents',
    'Approx. 33 in length',
    13,
    5,
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
  sort_order = VALUES(sort_order),
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
    '/assets/product-shield-1.jpg',
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

INSERT INTO hero_banners (
  slug,
  eyebrow,
  title_top,
  title_bottom,
  copy_text,
  image_url,
  sort_order,
  is_active
)
VALUES
  (
    'timeless-culture-banner',
    'Premium Craftsmanship Since 2015',
    'Timeless Culture',
    'Modern Vision',
    'From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.',
    '/assets/product-statue-1.jpg',
    1,
    1
  ),
  (
    'warrior-legacy-banner',
    'Made For Proud Spaces',
    'Warrior Legacy',
    'Handcrafted Detail',
    'Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.',
    '/assets/products-poster.jpg',
    2,
    1
  ),
  (
    'royal-presence-banner',
    'Signature Heritage Collection',
    'Royal Presence',
    'Bold Display',
    'Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.',
    '/assets/product-weapon-1.jpeg',
    3,
    1
  )
ON DUPLICATE KEY UPDATE
  eyebrow = VALUES(eyebrow),
  title_top = VALUES(title_top),
  title_bottom = VALUES(title_bottom),
  copy_text = VALUES(copy_text),
  image_url = VALUES(image_url),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

INSERT INTO homepage_reviews (
  id,
  author_name,
  review_text,
  rating,
  location,
  sort_order,
  is_active
)
VALUES
  (
    1,
    'Prasad Jadhav',
    'The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.',
    5,
    'Pune',
    1,
    1
  ),
  (
    2,
    'Snehal Patil',
    'We ordered a heritage gift piece for our office and it looked even better in person than in the photos.',
    5,
    'Kolhapur',
    2,
    1
  ),
  (
    3,
    'Amit Deshmukh',
    'Very responsive team, great craftsmanship, and clear updates throughout the order process.',
    4,
    'Mumbai',
    3,
    1
  )
ON DUPLICATE KEY UPDATE
  author_name = VALUES(author_name),
  review_text = VALUES(review_text),
  rating = VALUES(rating),
  location = VALUES(location),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

INSERT INTO homepage_videos (
  id,
  title,
  description,
  video_url,
  video_type,
  thumbnail_url,
  sort_order,
  is_active
)
VALUES
  (
      1,
      'Shivkalin Shastranche Aajche Shilpakar',
      'Satyajit Arun Vaidya shares his journey from passion to profession in historical weapon crafting.',
      'https://youtu.be/xh-ibz0qxaA',
      'youtube',
      NULL,
      1,
      1
    ),
  (
    2,
      'Bhetarupi Aitihasik Shastra Banavnare Satyajeet Vaidya',
      'Historic weapons as gifts and display pieces that preserve traditional craftsmanship.',
      'https://youtu.be/2alkiZgDxMI',
      'youtube',
      NULL,
      2,
      1
    ),
  (
    3,
      'Puratan Shastrancha Itihas Jopasanara Kalakar Mavala',
      'A short feature on the artisan spirit and the story behind these heritage-inspired creations.',
      'https://youtu.be/WpBQTatwZhs',
      'youtube',
      NULL,
      3,
      1
    )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  video_url = VALUES(video_url),
  video_type = VALUES(video_type),
  thumbnail_url = VALUES(thumbnail_url),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

