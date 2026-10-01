-- Demo data. Run AFTER schema.sql. Re-running wipes the three tables and starts ids from 1.
-- Passwords (bcrypt, 10 rounds):
--   admin  -> Admin@123
--   owners -> Owner@123
--   users  -> User@123

TRUNCATE TABLE ratings, stores, users RESTART IDENTITY CASCADE;

-- ids 1..8 (admin, 2 owners, 5 users)
INSERT INTO users (name, email, password, address, role) VALUES
  ('System Administrator Account', 'admin@storerating.com',  '$2a$10$CP/uCG0SoSI8GxkC3NslleysvHhbmei2kDyyrEDKq2A4hIZS2Oupq', '12 Admin Tower, Sector 18, Noida, Uttar Pradesh', 'ADMIN'),
  ('Rahul Sharma Store Owner',    'owner1@storerating.com',  '$2a$10$PVWWQ7ElZucoXPiDRk7fT.Al6fm8c11kibQZOmWoLx/SwTWCO0VTu', '45 Civil Lines, Agra, Uttar Pradesh',            'OWNER'),
  ('Priya Verma Store Owner',     'owner2@storerating.com',  '$2a$10$PVWWQ7ElZucoXPiDRk7fT.Al6fm8c11kibQZOmWoLx/SwTWCO0VTu', '8 Krishna Nagar, Mathura, Uttar Pradesh',        'OWNER'),
  ('Amit Kumar Verma Customer',   'amit@example.com',        '$2a$10$e6lLmDkxmHWG2aHmaGE.guhCDUkVJsQU5xhKVu/BRK0Gb.jep3oJK', '21 MG Road, Agra, Uttar Pradesh',                'USER'),
  ('Neha Gupta Regular Customer', 'neha@example.com',        '$2a$10$e6lLmDkxmHWG2aHmaGE.guhCDUkVJsQU5xhKVu/BRK0Gb.jep3oJK', '17 Sadar Bazaar, Mathura, Uttar Pradesh',        'USER'),
  ('Rohit Singh Shopper Account', 'rohit@example.com',       '$2a$10$e6lLmDkxmHWG2aHmaGE.guhCDUkVJsQU5xhKVu/BRK0Gb.jep3oJK', '90 Hari Parvat, Agra, Uttar Pradesh',            'USER'),
  ('Sneha Patel Retail Customer', 'sneha@example.com',       '$2a$10$e6lLmDkxmHWG2aHmaGE.guhCDUkVJsQU5xhKVu/BRK0Gb.jep3oJK', '33 Vrindavan Road, Mathura, Uttar Pradesh',      'USER'),
  ('Vikram Joshi Online Buyer',   'vikram@example.com',      '$2a$10$e6lLmDkxmHWG2aHmaGE.guhCDUkVJsQU5xhKVu/BRK0Gb.jep3oJK', '5 Taj Ganj, Agra, Uttar Pradesh',                'USER');

-- ids 1..4. Stores 3 and 4 have no owner yet (an admin can add owners later).
INSERT INTO stores (name, email, address, owner_id) VALUES
  ('Green Basket Grocery Market',   'contact@greenbasket.com',   '45 Civil Lines, Agra, Uttar Pradesh',       2),
  ('Sunrise Electronics Hub Store', 'hello@sunriseelectro.com',  '8 Krishna Nagar, Mathura, Uttar Pradesh',   3),
  ('Book Nook Reading Corner Shop', 'books@booknook.com',        '14 Sadar Bazaar, Mathura, Uttar Pradesh',   NULL),
  ('Urban Threads Clothing Outlet', 'sales@urbanthreads.com',    '60 Sanjay Place, Agra, Uttar Pradesh',      NULL);

-- Store 1: 4 ratings, store 2: 3 ratings, store 3: 2 ratings, store 4: no ratings.
INSERT INTO ratings (user_id, store_id, rating) VALUES
  (4, 1, 5), (5, 1, 4), (6, 1, 4), (7, 1, 3),
  (4, 2, 3), (5, 2, 5), (8, 2, 4),
  (6, 3, 5), (7, 3, 4);
