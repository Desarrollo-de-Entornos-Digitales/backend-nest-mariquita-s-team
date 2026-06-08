BEGIN;

INSERT INTO roles (name, description)
VALUES
  ('admin', 'System administrator'),
  ('seller', 'Agricultural seller'),
  ('buyer', 'Agricultural buyer')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO permissions (name, description)
VALUES
  ('role:create', 'Permission role:create'),
  ('role:read', 'Permission role:read'),
  ('role:update', 'Permission role:update'),
  ('role:delete', 'Permission role:delete'),
  ('auth:logout', 'Permission auth:logout'),
  ('user:read', 'Permission user:read'),
  ('user:update', 'Permission user:update'),
  ('user:delete', 'Permission user:delete'),
  ('product:create', 'Permission product:create'),
  ('product:read', 'Permission product:read'),
  ('product:update', 'Permission product:update'),
  ('product:delete', 'Permission product:delete'),
  ('product:purchase', 'Permission product:purchase'),
  ('category:create', 'Permission category:create'),
  ('category:read', 'Permission category:read'),
  ('category:update', 'Permission category:update'),
  ('category:delete', 'Permission category:delete'),
  ('order:create', 'Permission order:create'),
  ('order:read', 'Permission order:read'),
  ('order:update', 'Permission order:update'),
  ('order:delete', 'Permission order:delete'),
  ('payment:create', 'Permission payment:create'),
  ('payment:read', 'Permission payment:read'),
  ('payment:update', 'Permission payment:update'),
  ('payment:delete', 'Permission payment:delete'),
  ('chat:create', 'Permission chat:create'),
  ('chat:read', 'Permission chat:read'),
  ('chat:update', 'Permission chat:update'),
  ('chat:delete', 'Permission chat:delete'),
  ('message:create', 'Permission message:create'),
  ('message:read', 'Permission message:read'),
  ('message:update', 'Permission message:update'),
  ('message:delete', 'Permission message:delete'),
  ('cart:read', 'Permission cart:read'),
  ('cart:update', 'Permission cart:update'),
  ('cart:checkout', 'Permission cart:checkout'),
  ('notification:read', 'Permission notification:read'),
  ('notification:update', 'Permission notification:update')
ON CONFLICT (name) DO NOTHING;

DELETE FROM role_permissions a
USING role_permissions b
WHERE a.id > b.id
  AND a.role_id = b.role_id
  AND a.permission_id = b.permission_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_role_permissions_role_permission
  ON role_permissions (role_id, permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
  'role:create','role:read','role:update','role:delete',
  'auth:logout',
  'user:read','user:update','user:delete',
  'product:create','product:read','product:update','product:delete','product:purchase',
  'category:create','category:read','category:update','category:delete',
  'order:create','order:read','order:update','order:delete',
  'payment:create','payment:read','payment:update','payment:delete',
  'chat:create','chat:read','chat:update','chat:delete',
  'message:create','message:read','message:update','message:delete',
  'cart:read','cart:update','cart:checkout',
  'notification:read','notification:update'
)
WHERE r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
  'product:create','product:read','product:update','product:delete',
  'auth:logout',
  'category:read',
  'order:read',
  'payment:read',
  'chat:create','chat:read',
  'message:create','message:read',
  'notification:read','notification:update'
)
WHERE r.name = 'seller'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
  'product:read','product:purchase',
  'auth:logout',
  'category:read',
  'order:create','order:read',
  'payment:create','payment:read',
  'chat:create','chat:read',
  'message:create','message:read',
  'cart:read','cart:update','cart:checkout'
  ,'notification:read','notification:update'
)
WHERE r.name = 'buyer'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

INSERT INTO users (username, email, password_hash, bio, role_id)
VALUES
  (
    'admin',
    'admin@vincobov.com',
    '$2b$10$VZWSVgzh9cXLAaztMbGbfeLnirjOTBCE8KS897DmsO5mQlA2Mr8NC',
    'System administrator',
    (SELECT id FROM roles WHERE name = 'admin')
  ),
  (
    'seller1',
    'seller1@vincobov.com',
    '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK',
    'Agricultural seller',
    (SELECT id FROM roles WHERE name = 'seller')
  ),
  (
    'buyer1',
    'buyer1@vincobov.com',
    '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om',
    'Agricultural buyer',
    (SELECT id FROM roles WHERE name = 'buyer')
  )
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  bio = EXCLUDED.bio,
  role_id = EXCLUDED.role_id;

INSERT INTO categories (name, description)
VALUES
  ('Livestock', 'Category for cattle and sheep'),
  ('Crops', 'Category for grains, fruits, and vegetables'),
  ('Dairy', 'Category for milk and dairy products'),
  ('Supplies', 'Category for agricultural supplies'),
  ('Machinery', 'Category for equipment and tools'),
  ('Forage', 'Category for animal feed')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO users (username, email, password_hash, bio, role_id)
VALUES
  ('seller2', 'seller2@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Vegetable producer in Boyaca', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller3', 'seller3@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Cattle rancher in Santander', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller4', 'seller4@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Artisan dairy supplier', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller5', 'seller5@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Grain and cereal seller', (SELECT id FROM roles WHERE name = 'seller')),
  ('buyer2', 'buyer2@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Wholesale food buyer', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer3', 'buyer3@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Local restaurant in Tunja', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer4', 'buyer4@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Farmers market distributor', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer5', 'buyer5@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Institutional buyer', (SELECT id FROM roles WHERE name = 'buyer'))
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  bio = EXCLUDED.bio,
  role_id = EXCLUDED.role_id;

INSERT INTO products (title, description, image_url, category, price, stock, location, created_by)
SELECT * FROM (
  VALUES
    ('Premium fattened steer', 'Steers for backgrounding and finishing with sanitary control', 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 4800000.00, 12, 'Duitama', (SELECT id FROM users WHERE email = 'seller1@vincobov.com')),
    ('Holstein dairy cows', 'High-production dairy cow lot', 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 6200000.00, 8, 'Sogamoso', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Breeding sheep', 'Native sheep adapted to cold climates', 'https://images.pexels.com/photos/751689/pexels-photo-751689.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 540000.00, 30, 'Paipa', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Selected pastusa potatoes', 'Clean potatoes sold per 50kg sack', 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=1200', 'agriculture'::products_category_enum, 110000.00, 140, 'Tunja', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Fresh round tomatoes', 'Crate of first-quality tomatoes', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1200', 'agriculture'::products_category_enum, 68000.00, 200, 'Samaca', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Organic spring onions', 'Fresh bundles harvested the same day', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1200', 'agriculture'::products_category_enum, 22000.00, 300, 'Villa de Leyva', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('75HP agricultural tractor', 'Mixed-use tractor for field work and transport', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1200', 'supplies_equipment'::products_category_enum, 85000000.00, 2, 'Duitama', (SELECT id FROM users WHERE email = 'seller1@vincobov.com')),
    ('5km electric fence kit', 'Complete electric fence kit for livestock', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1200', 'supplies_equipment'::products_category_enum, 1200000.00, 15, 'Sogamoso', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Galvanized feed troughs', 'Durable cattle feeders, pack of 10 units', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1200', 'supplies_equipment'::products_category_enum, 450000.00, 40, 'Paipa', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Portable milking system', 'Electric milking system for small producers', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1200', 'supplies_equipment'::products_category_enum, 2800000.00, 8, 'Ubate', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Premium white rice', 'Refined rice for bulk consumption', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 85000.00, 220, 'Bogota', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Sorted cargamanto beans', 'Selected and cleaned dry beans', 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 145000.00, 100, 'Bucaramanga', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Yellow corn flour', '25kg pack for bakeries and arepas', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 92000.00, 90, 'Chiquinquira', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Artisan farmhouse cheese', 'Fresh cheese made on the farm', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 32000.00, 160, 'Ubate', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Refrigerated raw milk', 'Tank milk with quality control', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 4200.00, 1200, 'Paz de Rio', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Livestock molasses supplement', 'Energy supplement for cattle', 'https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 59000.00, 70, 'Moniquira', (SELECT id FROM users WHERE email = 'seller1@vincobov.com'))
) AS seed_products(title, description, image_url, category, price, stock, location, created_by)
WHERE NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p.title = seed_products.title
    AND p.created_by = seed_products.created_by
);

UPDATE products p
SET image_url = product_images.image_url
FROM (
  VALUES
    ('Premium fattened steer', 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller1@vincobov.com')),
    ('Holstein dairy cows', 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Breeding sheep', 'https://images.pexels.com/photos/751689/pexels-photo-751689.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Selected pastusa potatoes', 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Fresh round tomatoes', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Organic spring onions', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Premium white rice', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Sorted cargamanto beans', 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Yellow corn flour', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Artisan farmhouse cheese', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Refrigerated raw milk', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Livestock molasses supplement', 'https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller1@vincobov.com'))
) AS product_images(title, image_url, created_by)
WHERE p.title = product_images.title
  AND p.created_by = product_images.created_by;

INSERT INTO orders (buyer_id, product_id, quantity, unit_price, total_price, status)
SELECT * FROM (
  VALUES
    ((SELECT id FROM users WHERE email = 'buyer1@vincobov.com'), (SELECT id FROM products WHERE title = 'Selected pastusa potatoes' LIMIT 1), 3, 110000.00, 330000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer2@vincobov.com'), (SELECT id FROM products WHERE title = 'Fresh round tomatoes' LIMIT 1), 5, 68000.00, 340000.00, 'pending'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), (SELECT id FROM products WHERE title = 'Artisan farmhouse cheese' LIMIT 1), 8, 32000.00, 256000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer4@vincobov.com'), (SELECT id FROM products WHERE title = 'Premium white rice' LIMIT 1), 10, 85000.00, 850000.00, 'pending'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer5@vincobov.com'), (SELECT id FROM products WHERE title = 'Holstein dairy cows' LIMIT 1), 1, 6200000.00, 6200000.00, 'cancelled'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer2@vincobov.com'), (SELECT id FROM products WHERE title = 'Yellow corn flour' LIMIT 1), 6, 92000.00, 552000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), (SELECT id FROM products WHERE title = 'Sorted cargamanto beans' LIMIT 1), 4, 145000.00, 580000.00, 'pending'::orders_status_enum)
) AS seed_orders(buyer_id, product_id, quantity, unit_price, total_price, status)
WHERE seed_orders.buyer_id IS NOT NULL
  AND seed_orders.product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.buyer_id = seed_orders.buyer_id
      AND o.product_id = seed_orders.product_id
      AND o.quantity = seed_orders.quantity
      AND o.total_price = seed_orders.total_price
  );

INSERT INTO payments (order_id, amount, payment_method, status)
SELECT * FROM (
  VALUES
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer1@vincobov.com' AND p.title = 'Selected pastusa potatoes' ORDER BY o.id DESC LIMIT 1), 330000.00, 'transfer'::payments_payment_method_enum, 'completed'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer3@vincobov.com' AND p.title = 'Artisan farmhouse cheese' ORDER BY o.id DESC LIMIT 1), 256000.00, 'card'::payments_payment_method_enum, 'completed'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer2@vincobov.com' AND p.title = 'Fresh round tomatoes' ORDER BY o.id DESC LIMIT 1), 340000.00, 'cash'::payments_payment_method_enum, 'pending'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer2@vincobov.com' AND p.title = 'Yellow corn flour' ORDER BY o.id DESC LIMIT 1), 552000.00, 'transfer'::payments_payment_method_enum, 'completed'::payments_status_enum)
) AS seed_payments(order_id, amount, payment_method, status)
WHERE seed_payments.order_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM payments pay
    WHERE pay.order_id = seed_payments.order_id
      AND pay.amount = seed_payments.amount
      AND pay.payment_method = seed_payments.payment_method
  );

INSERT INTO chats (seller_id, buyer_id)
SELECT * FROM (
  VALUES
    ((SELECT id FROM users WHERE email = 'seller1@vincobov.com'), (SELECT id FROM users WHERE email = 'buyer1@vincobov.com')),
    ((SELECT id FROM users WHERE email = 'seller2@vincobov.com'), (SELECT id FROM users WHERE email = 'buyer2@vincobov.com')),
    ((SELECT id FROM users WHERE email = 'seller3@vincobov.com'), (SELECT id FROM users WHERE email = 'buyer3@vincobov.com')),
    ((SELECT id FROM users WHERE email = 'seller4@vincobov.com'), (SELECT id FROM users WHERE email = 'buyer4@vincobov.com')),
    ((SELECT id FROM users WHERE email = 'seller5@vincobov.com'), (SELECT id FROM users WHERE email = 'buyer5@vincobov.com'))
) AS seed_chats(seller_id, buyer_id)
WHERE seed_chats.seller_id IS NOT NULL
  AND seed_chats.buyer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM chats c
    WHERE c.seller_id = seed_chats.seller_id
      AND c.buyer_id = seed_chats.buyer_id
  );

INSERT INTO messages (chat_id, sender_id, content)
SELECT * FROM (
  VALUES
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller1@vincobov.com' AND b.email = 'buyer1@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller1@vincobov.com'), 'Hello, I have steers available for immediate delivery.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller1@vincobov.com' AND b.email = 'buyer1@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer1@vincobov.com'), 'Perfect, I would like to coordinate shipping this week.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller2@vincobov.com' AND b.email = 'buyer2@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller2@vincobov.com'), 'The tomatoes were just harvested and are ready to ship.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller3@vincobov.com' AND b.email = 'buyer3@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), 'I need a bulk quote for breeding sheep.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller4@vincobov.com' AND b.email = 'buyer4@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller4@vincobov.com'), 'I have farmhouse cheese available in 1kg and 2kg packs.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller5@vincobov.com' AND b.email = 'buyer5@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer5@vincobov.com'), 'Monthly delivery of premium rice would work for me.')
) AS seed_messages(chat_id, sender_id, content)
WHERE seed_messages.chat_id IS NOT NULL
  AND seed_messages.sender_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM messages m
    WHERE m.chat_id = seed_messages.chat_id
      AND m.sender_id = seed_messages.sender_id
      AND m.content = seed_messages.content
  );

UPDATE products
SET category = 'agriculture'::products_category_enum
WHERE category::text = 'crop';

UPDATE products AS p
SET
  title = translations.new_title,
  description = translations.new_description
FROM (
  VALUES
    ('Novillo cebado premium', 'Premium fattened steer', 'Steers for backgrounding and finishing with sanitary control'),
    ('Vacas lecheras Holstein', 'Holstein dairy cows', 'High-production dairy cow lot'),
    ('Ovejas de cria', 'Breeding sheep', 'Native sheep adapted to cold climates'),
    ('Papa pastusa seleccionada', 'Selected pastusa potatoes', 'Clean potatoes sold per 50kg sack'),
    ('Tomate chonto fresco', 'Fresh round tomatoes', 'Crate of first-quality tomatoes'),
    ('Cebolla larga organica', 'Organic spring onions', 'Fresh bundles harvested the same day'),
    ('Tractor agricola 75HP', '75HP agricultural tractor', 'Mixed-use tractor for field work and transport'),
    ('Cerca electrica 5km', '5km electric fence kit', 'Complete electric fence kit for livestock'),
    ('Comederos galvanizados', 'Galvanized feed troughs', 'Durable cattle feeders, pack of 10 units'),
    ('Equipo de ordeño portatil', 'Portable milking system', 'Electric milking system for small producers'),
    ('Arroz blanco premium', 'Premium white rice', 'Refined rice for bulk consumption'),
    ('Frijol cargamanto clasificado', 'Sorted cargamanto beans', 'Selected and cleaned dry beans'),
    ('Harina de maiz amarillo', 'Yellow corn flour', '25kg pack for bakeries and arepas'),
    ('Queso campesino artesanal', 'Artisan farmhouse cheese', 'Fresh cheese made on the farm'),
    ('Leche cruda refrigerada', 'Refrigerated raw milk', 'Tank milk with quality control'),
    ('Melaza para alimento', 'Livestock molasses supplement', 'Energy supplement for cattle')
) AS translations(old_title, new_title, new_description)
WHERE p.title = translations.old_title;

COMMIT;
