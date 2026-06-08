-- Limpia datos de demo/transaccionales y deja roles, permisos y estructura.
-- Despues de ejecutar esto, corre: db/seed.initial.sql

BEGIN;

TRUNCATE TABLE
  messages,
  chats,
  favorites,
  product_reviews,
  notifications,
  cart_items,
  carts,
  payments,
  orders,
  products
RESTART IDENTITY CASCADE;

-- Opcional: quitar usuarios de prueba creados manualmente (conserva los del seed)
DELETE FROM users
WHERE email NOT IN (
  'admin@vincobov.com',
  'seller1@vincobov.com',
  'seller2@vincobov.com',
  'seller3@vincobov.com',
  'seller4@vincobov.com',
  'seller5@vincobov.com',
  'buyer1@vincobov.com',
  'buyer2@vincobov.com',
  'buyer3@vincobov.com',
  'buyer4@vincobov.com',
  'buyer5@vincobov.com'
);

COMMIT;
