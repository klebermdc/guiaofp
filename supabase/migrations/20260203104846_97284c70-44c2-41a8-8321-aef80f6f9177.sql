-- Add Disney Springs shops as POIs in content_items
-- Category ID for Disney Springs: e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b
-- Type must be 'poi' with cuisine_type as 'shop' indicator

INSERT INTO content_items (title, type, category_id, description, latitude, longitude, is_published, cuisine_type) VALUES
-- West Side (Disney Flagship Stores)
('World of Disney', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'A maior loja Disney do mundo com produtos exclusivos', 28.3712, -81.5210, true, 'shop'),
('LEGO Store', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Loja oficial LEGO com peças exclusivas e área interativa', 28.3695, -81.5225, true, 'shop'),
('Disney''s Days of Christmas', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Loja especializada em decorações e itens natalinos Disney', 28.3705, -81.5192, true, 'shop'),
('Star Wars Galactic Outpost', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Produtos exclusivos de Star Wars', 28.3708, -81.5218, true, 'shop'),

-- Marketplace
('Marketplace Co-Op', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Várias boutiques em um só lugar com produtos únicos', 28.3706, -81.5175, true, 'shop'),
('The Dress Shop', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Vestidos vintage inspirados em personagens Disney', 28.3704, -81.5168, true, 'shop'),
('Goofy''s Candy Co.', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Doces, caramelos e guloseimas temáticas', 28.3708, -81.5180, true, 'shop'),
('Disney''s Wonderful World of Memories', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Álbuns, scrapbooks e itens de memória', 28.3702, -81.5172, true, 'shop'),
('Tren-D', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda feminina com estilo Disney contemporâneo', 28.3700, -81.5165, true, 'shop'),
('Once Upon a Toy', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Brinquedos clássicos e montagem de sabres de luz', 28.3698, -81.5178, true, 'shop'),
('Disney''s Pin Traders', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Pins colecionáveis e acessórios para lanyards', 28.3703, -81.5162, true, 'shop'),

-- Town Center (Fashion & Lifestyle)
('Uniqlo', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda casual japonesa com coleções Disney', 28.3725, -81.5188, true, 'shop'),
('Zara', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda espanhola para toda a família', 28.3728, -81.5185, true, 'shop'),
('Sephora', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Cosméticos e produtos de beleza premium', 28.3722, -81.5192, true, 'shop'),
('Kate Spade New York', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Bolsas, acessórios e roupas femininas', 28.3730, -81.5180, true, 'shop'),
('Pandora', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Joias e charms exclusivos, incluindo linha Disney', 28.3718, -81.5195, true, 'shop'),
('Tommy Bahama', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Roupas e acessórios estilo resort', 28.3732, -81.5175, true, 'shop'),
('Lilly Pulitzer', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda feminina colorida e tropical', 28.3720, -81.5200, true, 'shop'),

-- West Side Entertainment District
('Sugarboo & Co.', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Presentes artesanais e decoração para casa', 28.3690, -81.5230, true, 'shop'),
('Sunglass Hut', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Óculos de sol de marcas premium', 28.3715, -81.5205, true, 'shop'),
('Superdry', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda britânica com inspiração japonesa', 28.3726, -81.5178, true, 'shop'),
('Shore', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Roupas de banho e moda praia', 28.3710, -81.5170, true, 'shop'),
('Everything But Water', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Moda resort e beachwear premium', 28.3724, -81.5182, true, 'shop'),
('Columbia Sportswear', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Roupas e equipamentos outdoor', 28.3692, -81.5235, true, 'shop'),
('UGG', 'poi', 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b', 'Calçados e acessórios de conforto', 28.3728, -81.5172, true, 'shop');