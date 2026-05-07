BEGIN;

INSERT INTO roles (name, description)
VALUES
  ('admin', 'Administrador del sistema'),
  ('seller', 'Vendedor agropecuario'),
  ('buyer', 'Comprador agropecuario')
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
  ('message:delete', 'Permission message:delete')
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
  'message:create','message:read','message:update','message:delete'
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
  'message:create','message:read'
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
  'message:create','message:read'
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
    'Administrador del sistema',
    (SELECT id FROM roles WHERE name = 'admin')
  ),
  (
    'seller1',
    'seller1@vincobov.com',
    '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK',
    'Vendedor agropecuario',
    (SELECT id FROM roles WHERE name = 'seller')
  ),
  (
    'buyer1',
    'buyer1@vincobov.com',
    '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om',
    'Comprador agropecuario',
    (SELECT id FROM roles WHERE name = 'buyer')
  )
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  bio = EXCLUDED.bio,
  role_id = EXCLUDED.role_id;

INSERT INTO categories (name, description)
VALUES
  ('Ganado', 'Categoria para bovinos y ovinos'),
  ('Cultivos', 'Categoria para granos, frutas y verduras'),
  ('Lacteos', 'Categoria para leche y derivados'),
  ('Insumos', 'Categoria para insumos agropecuarios'),
  ('Maquinaria', 'Categoria para equipos y herramientas'),
  ('Forrajes', 'Categoria para alimentacion animal')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO users (username, email, password_hash, bio, role_id)
VALUES
  ('seller2', 'seller2@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Productor de hortalizas en Boyaca', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller3', 'seller3@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Ganadero en Santander', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller4', 'seller4@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Proveedor de lacteos artesanales', (SELECT id FROM roles WHERE name = 'seller')),
  ('seller5', 'seller5@vincobov.com', '$2b$10$J.QYR5G0wz9cijv/TB5GyOWh9eQ/wzWvCn6.Q10E4IfJ4Rm5V2xiK', 'Vendedor de granos y cereales', (SELECT id FROM roles WHERE name = 'seller')),
  ('buyer2', 'buyer2@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Comprador mayorista de alimentos', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer3', 'buyer3@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Restaurante local en Tunja', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer4', 'buyer4@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Distribuidor de plazas de mercado', (SELECT id FROM roles WHERE name = 'buyer')),
  ('buyer5', 'buyer5@vincobov.com', '$2b$10$EiXWjSY3YBQjy/jbd4.6a.gurN7pXz1sKDCbnpqj6Gtvj455G8/om', 'Comprador institucional', (SELECT id FROM roles WHERE name = 'buyer'))
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  bio = EXCLUDED.bio,
  role_id = EXCLUDED.role_id;

INSERT INTO products (title, description, image_url, category, price, stock, location, created_by)
SELECT * FROM (
  VALUES
    ('Novillo cebado premium', 'Novillos para levante y ceba con control sanitario', 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 4800000.00, 12, 'Duitama', (SELECT id FROM users WHERE email = 'seller1@vincobov.com')),
    ('Vacas lecheras Holstein', 'Lote de vacas de alta produccion', 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 6200000.00, 8, 'Sogamoso', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Ovejas de cria', 'Ovejas criollas adaptadas a clima frio', 'https://images.pexels.com/photos/751689/pexels-photo-751689.jpeg?auto=compress&cs=tinysrgb&w=1200', 'livestock'::products_category_enum, 540000.00, 30, 'Paipa', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Papa pastusa seleccionada', 'Papa limpia por bulto de 50kg', 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=1200', 'crop'::products_category_enum, 110000.00, 140, 'Tunja', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Tomate chonto fresco', 'Canastilla de tomate de primera calidad', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1200', 'crop'::products_category_enum, 68000.00, 200, 'Samaca', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Cebolla larga organica', 'Atados frescos cosechados el mismo dia', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1200', 'crop'::products_category_enum, 22000.00, 300, 'Villa de Leyva', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Arroz blanco premium', 'Arroz refinado para consumo masivo', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 85000.00, 220, 'Bogota', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Frijol cargamanto clasificado', 'Grano seco seleccionado y limpio', 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 145000.00, 100, 'Bucaramanga', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Harina de maiz amarillo', 'Empaque de 25kg para panaderia y arepas', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 92000.00, 90, 'Chiquinquira', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Queso campesino artesanal', 'Queso fresco elaborado en finca', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 32000.00, 160, 'Ubate', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Leche cruda refrigerada', 'Leche de tanque con control de calidad', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 4200.00, 1200, 'Paz de Rio', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Melaza para alimento', 'Suplemento energetico para ganado', 'https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=1200', 'refined'::products_category_enum, 59000.00, 70, 'Moniquira', (SELECT id FROM users WHERE email = 'seller1@vincobov.com'))
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
    ('Novillo cebado premium', 'https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller1@vincobov.com')),
    ('Vacas lecheras Holstein', 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Ovejas de cria', 'https://images.pexels.com/photos/751689/pexels-photo-751689.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller3@vincobov.com')),
    ('Papa pastusa seleccionada', 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Tomate chonto fresco', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Cebolla larga organica', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller2@vincobov.com')),
    ('Arroz blanco premium', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Frijol cargamanto clasificado', 'https://images.pexels.com/photos/6544376/pexels-photo-6544376.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Harina de maiz amarillo', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller5@vincobov.com')),
    ('Queso campesino artesanal', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Leche cruda refrigerada', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller4@vincobov.com')),
    ('Melaza para alimento', 'https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=1200', (SELECT id FROM users WHERE email = 'seller1@vincobov.com'))
) AS product_images(title, image_url, created_by)
WHERE p.title = product_images.title
  AND p.created_by = product_images.created_by;

INSERT INTO orders (buyer_id, product_id, quantity, unit_price, total_price, status)
SELECT * FROM (
  VALUES
    ((SELECT id FROM users WHERE email = 'buyer1@vincobov.com'), (SELECT id FROM products WHERE title = 'Papa pastusa seleccionada' LIMIT 1), 3, 110000.00, 330000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer2@vincobov.com'), (SELECT id FROM products WHERE title = 'Tomate chonto fresco' LIMIT 1), 5, 68000.00, 340000.00, 'pending'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), (SELECT id FROM products WHERE title = 'Queso campesino artesanal' LIMIT 1), 8, 32000.00, 256000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer4@vincobov.com'), (SELECT id FROM products WHERE title = 'Arroz blanco premium' LIMIT 1), 10, 85000.00, 850000.00, 'pending'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer5@vincobov.com'), (SELECT id FROM products WHERE title = 'Vacas lecheras Holstein' LIMIT 1), 1, 6200000.00, 6200000.00, 'cancelled'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer2@vincobov.com'), (SELECT id FROM products WHERE title = 'Harina de maiz amarillo' LIMIT 1), 6, 92000.00, 552000.00, 'paid'::orders_status_enum),
    ((SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), (SELECT id FROM products WHERE title = 'Frijol cargamanto clasificado' LIMIT 1), 4, 145000.00, 580000.00, 'pending'::orders_status_enum)
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
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer1@vincobov.com' AND p.title = 'Papa pastusa seleccionada' ORDER BY o.id DESC LIMIT 1), 330000.00, 'transfer'::payments_payment_method_enum, 'completed'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer3@vincobov.com' AND p.title = 'Queso campesino artesanal' ORDER BY o.id DESC LIMIT 1), 256000.00, 'card'::payments_payment_method_enum, 'completed'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer2@vincobov.com' AND p.title = 'Tomate chonto fresco' ORDER BY o.id DESC LIMIT 1), 340000.00, 'cash'::payments_payment_method_enum, 'pending'::payments_status_enum),
    ((SELECT o.id FROM orders o JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id WHERE u.email = 'buyer2@vincobov.com' AND p.title = 'Harina de maiz amarillo' ORDER BY o.id DESC LIMIT 1), 552000.00, 'transfer'::payments_payment_method_enum, 'completed'::payments_status_enum)
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
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller1@vincobov.com' AND b.email = 'buyer1@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller1@vincobov.com'), 'Hola, tengo disponibilidad inmediata de novillos.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller1@vincobov.com' AND b.email = 'buyer1@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer1@vincobov.com'), 'Perfecto, me interesa coordinar el envio esta semana.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller2@vincobov.com' AND b.email = 'buyer2@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller2@vincobov.com'), 'El tomate esta recien cosechado y listo para despacho.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller3@vincobov.com' AND b.email = 'buyer3@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer3@vincobov.com'), 'Necesito cotizacion por volumen para ovejas de cria.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller4@vincobov.com' AND b.email = 'buyer4@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'seller4@vincobov.com'), 'Tengo queso campesino en presentacion de 1kg y 2kg.'),
    ((SELECT c.id FROM chats c JOIN users s ON s.id = c.seller_id JOIN users b ON b.id = c.buyer_id WHERE s.email = 'seller5@vincobov.com' AND b.email = 'buyer5@vincobov.com' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer5@vincobov.com'), 'Me sirve entrega mensual de arroz premium.')
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

COMMIT;
