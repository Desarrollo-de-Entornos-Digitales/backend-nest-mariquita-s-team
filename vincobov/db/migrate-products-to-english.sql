BEGIN;

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
