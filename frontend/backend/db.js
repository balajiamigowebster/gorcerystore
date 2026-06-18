const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      database: 'zepto_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL/MariaDB server.');

    await connection.query('CREATE DATABASE IF NOT EXISTS zepto_db;');
    console.log('Database "zepto_db" checked/created.');
    await connection.end();

    connection = await mysql.createConnection({ ...dbConfig, database: 'zepto_db' });

    // Drop tables on initialization to reset with the exact categories and products in the screenshots
    console.log('Resetting database tables to load exact PDF category mappings...');
    await connection.query('DROP TABLE IF EXISTS order_items;');
    await connection.query('DROP TABLE IF EXISTS orders;');
    await connection.query('DROP TABLE IF EXISTS products;');
    await connection.query('DROP TABLE IF EXISTS categories;');

    // Recreate Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon_name VARCHAR(50) NOT NULL,
        description TEXT
      );
    `);

    // Recreate Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        discount_price DECIMAL(10,2),
        category_id INT,
        image_url VARCHAR(500),
        unit VARCHAR(50) NOT NULL,
        stock INT NOT NULL DEFAULT 100,
        is_fresh TINYINT(1) DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 4.5,
        rating_count VARCHAR(20) DEFAULT '(1.0k)',
        is_bestseller TINYINT(1) DEFAULT 0,
        special_tag VARCHAR(50),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

    // Recreate Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        handling_fee DECIMAL(10,2) DEFAULT 4.00,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Recreate Order Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables initialized successfully.');

    // Seed PDF screenshot categories
    console.log('Seeding exact screenshot categories...');
    const categorySeeds = [
      // Main Categories
      ['Fruits & Vegetables', 'Fruits', 'Fresh fruits and organic vegetables'],
      ['Dairy, Bread & Eggs', 'DairyBread', 'Milk, butter, bread, and fresh farm eggs'],
      ['Atta, Rice, Oil & Dals', 'AttaRice', 'Atta, premium rice, cooking oils, and dals'],
      ['Meat, Fish & Eggs', 'MeatFish', 'Fresh meat, fish, and egg assortments'],
      ['Masala & Dry Fruits', 'MasalaDry', 'Spices, blended masalas, and dry fruits'],
      ['Breakfast & Sauces', 'BreakfastSauces', 'Cereals, jams, spreads, and sauces'],
      ['Packaged Food', 'Packaged', 'Noodles, ready to eat meals, and snacks'],
      ['Zepto Cafe', 'Cafe', 'Beverages, croissants, snacks from Zepto Cafe'],
      ['Tea, Coffee & More', 'TeaCoffee', 'Tea powders, instant coffee, and mixers'],
      ['Ice Cream & More', 'IceCreams', 'Ice cream tubs, cones, and desserts'],
      ['Frozen Food', 'Frozen', 'Frozen snacks, green peas, and fries'],

      // Sub / Section Categories
      ['Laundry Care', 'Laundry', 'Detergents, powders and liquid laundry care'],
      ['Rice', 'Rice', 'Basmati rice, raw rice, and poha variants'],
      ['Hair care', 'Hair', 'Conditioners, oils, serums, and styling gels'],
      ['Dal & Pulses', 'Dal', 'Toor dal, urad dal, fried gram, and lentils'],
      ['Personal Hygiene', 'Hygiene', 'Heat powders, talc, handwashes, and bathing soaps'],
      ['Oils & Ghee', 'Oils', 'Sunflower oil, ghee, and mustard oil'],
      ['Spices & Seasonings', 'Spices', 'Jeera, garlic paste, chilli powder, and spices'],
      ['Salt, Sugar & Jaggery', 'SaltSugar', 'Tata salt, white sugar, and jaggery blocks'],
      ['Chips & Crisps', 'Chips', 'Bingo potato chips, Lay\'s, and spicy crisps'],
      ['Namkeens', 'Namkeens', 'Murukku, nippattu, rings, and crunchy namkeens'],
      ['Soft Drinks & Mixers', 'Drinks', 'Soda, soft drinks, Sprite, and energy cans'],
      ['Juices & Healthy Drinks', 'Juices', 'Mango juices, tender coconut water, and soya milk'],
      ['Instant Foods', 'Instant', 'Cup noodles, ready parathas, and instant pasta'],
      ['Dairy Products', 'Dairy', 'Paneer, cheese slices, butter, and dairy products']
    ];

    await connection.query(
      'INSERT INTO categories (name, icon_name, description) VALUES ?',
      [categorySeeds]
    );
    console.log('Categories seeded.');

    // Fetch category IDs
    const [dbCats] = await connection.query('SELECT id, name FROM categories');
    const catMap = {};
    dbCats.forEach(c => { catMap[c.name] = c.id; });

    // Seed products exactly as shown in the screenshot pages
    const productSeeds = [
      // 1. Fruits & Vegetables
      ['Fresh Banana Robusta', 'Fresh sweet bananas robusta variety.', 50.00, 39.00, catMap['Fruits & Vegetables'], 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', '1 pack (500 g)', 100, 1, 4.8, '(15.2k)', 0, 'Fresh & Sweet'],
      ['Tomato - Hybrid', 'Fresh farm hybrid tomatoes.', 30.00, 24.00, catMap['Fruits & Vegetables'], 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80', '500 g', 100, 1, 4.7, '(8.4k)', 0, 'Farm Fresh'],
      ['Onion', 'Fresh pink onions.', 45.00, 38.00, catMap['Fruits & Vegetables'], 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&q=80', '1 kg', 100, 1, 4.6, '(23.0k)', 1, 'Bestseller'],
      ['Potato', 'Fresh cooking potatoes.', 35.00, 28.00, catMap['Fruits & Vegetables'], 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', '1 kg', 100, 1, 4.5, '(19.0k)', 0, 'Daily Need'],
      ['Apple Royal Gala', 'Crunchy sweet royal gala apples.', 180.00, 149.00, catMap['Fruits & Vegetables'], 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', '4 pcs', 100, 1, 4.8, '(1.2k)', 0, 'Imported Fruits'],

      // 2. Dairy, Bread & Eggs
      ['Amul Taaza Toned Fresh Milk', 'Fresh pasteurized toned milk by Amul.', 28.00, 27.00, catMap['Dairy, Bread & Eggs'], 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', '500 ml', 100, 1, 4.8, '(50.4k)', 1, 'Bestseller'],
      ['Modern Premium White Bread', 'Soft sliced premium white sandwich bread.', 45.00, 40.00, catMap['Dairy, Bread & Eggs'], 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', '400 g', 100, 0, 4.7, '(9.8k)', 0, 'Soft & Fresh'],
      ['Fresh Farm Eggs', 'Farm fresh white eggs packed safely.', 50.00, 45.00, catMap['Dairy, Bread & Eggs'], 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80', '6 pcs', 100, 1, 4.8, '(18.2k)', 0, 'High Protein'],

      // 12. Laundry Care
      ['Rin Matic Top Load Detergent Liquid | Pouch', 'Deep cleaning liquid detergent for top loading washing machines.', 260.00, 219.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/14b059a9-b0f1-4016-bf36-98399e86a83b/Rin-Matic-Top-Load-Detergent-Liquid-Pouch.jpg', '1 pack (2 kg)', 100, 0, 4.8, '(40.0k)', 0, 'Fresh & Fragrant'],
      ['Morelight Extra Power Detergent Powder', 'Extra power powder formulation for removing tough stains.', 540.00, 274.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2000-2000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/f10df2fd-301c-4760-af1f-b73c91df5a30/Morelight-Extra-Power-Detergent-Powder.jpeg', '1 pack (4 kg)', 100, 0, 4.8, '(13.7k)', 0, 'Fabric Protect'],
      ['Rin Matic Liquid Top Load', 'Advanced stain removal top load liquid laundry helper.', 420.00, 376.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/45a9c79f-4f58-4c66-a3d0-62650082f6ce/Rin-Matic-Liquid-Top-Load.jpeg', '1 pack (4 kg)', 100, 0, 4.8, '(1.1k)', 0, 'Stain Remover'],
      ['SafeWash Top Load Matic Premium Detergent Liquid | 2X Stain Removal', 'Premium laundry liquid with double cleaning efficiency.', 430.00, 198.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/826a7a32-cb16-4306-89a9-c2a38c52c95d/SafeWash-Top-Load-Matic-Premium-Detergent-Liquid-2X-Stain-Removal.jpg', '1 pack (2 L)', 100, 0, 4.8, '(6.2k)', 0, 'Colour Protect'],
      ['Ariel Power Gel Liquid Detergent for Front load washing machine', 'High performance power gel formulated for front loaders.', 855.00, 560.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/1a39f9f5-1858-4c3f-a6e5-2b3ef959496b/Ariel-Power-Gel-Liquid-Detergent-for-Front-load-washing-machine.jpeg', '1 pc (950 g)', 100, 0, 4.7, '(1.6k)', 0, 'Power Clean'],
      ['Ariel Power Gel Liquid Detergent for Top load washing machine', 'Liquid gel for top load washing machines, tough on stains.', 189.00, 179.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/1aaed251-649d-4120-a1ac-d26cc2aceed8/Ariel-Power-Gel-Liquid-Detergent-for-Top-load-washing-machine.jpeg', '1 pc (950 g)', 100, 0, 4.7, '(986)', 0, 'Power Clean'],
      ['Mr. White Front & Top Load Detergent Liquid', 'Specially formulated liquid detergent for dual machine types.', 189.00, 169.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/bd5b1601-46a0-4d9d-9ff8-41012cf33257/Mr-White-Front-Top-Load-Detergent-Liquid.jpeg', '1 pack (2 L)', 100, 0, 4.6, '(2.8k)', 0, 'Super Saver Pack'],
      ['Rin Matic Front Load Detergent Liquid | Pouch', 'Liquid detergent specifically designed for front loaders.', 285.00, 238.00, catMap['Laundry Care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/c7afda24-97d1-4297-be6b-e4064a214584/Rin-Matic-Front-Load-Detergent-Liquid-Pouch.jpg', '1 pack (2 kg)', 100, 0, 4.7, '(7.3k)', 0, 'Fresh & Fragrant'],

      // 13. Rice
      ['Daily Good Sona Masoori Raw Rice', 'Nutritious aged raw rice, ideal for daily meals.', 100.00, 72.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/bf4f32ed-f962-498e-80ff-948405d833af/Daily-Good-Sona-Masoori-Raw-Rice.jpeg', '1 pack (1 kg)', 100, 0, 4.7, '(22.7k)', 0, 'Aged Grain'],
      ['India Gate Dubar Basmati Rice | Long Slender Grains', 'Aromatic long slender basmati rice for biryanis.', 167.00, 139.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2000-2000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/c1b9c271-b314-4b5e-8b4a-da79bbf3c513/India-Gate-Dubar-Basmati-Rice-Long-Slender-Grains.jpeg', '1 pack (1 kg)', 100, 0, 4.9, '(19.5k)', 1, 'Bestseller'],
      ['India Gate Everyday Basmati Rice | Fluffy Medium Grains', 'Daily basmati rice, cooks fluffy and delicious.', 104.00, 92.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2000-2000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/19cc3c4c-53d2-488a-be0d-3a80c771df06/India-Gate-Everyday-Basmati-Rice-Fluffy-Medium-Grains.jpeg', '1 pack (1 kg)', 100, 0, 4.2, '(10.0k)', 0, 'Medium Grain'],
      ['921 Rozana Basmati Rice', 'Budget friendly Long grain basmati rice.', 125.00, 79.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1679-1679,pr-true,f-auto,q-40,dpr-2/cms/product_variant/faa65021-a06f-4866-8b8f-e95d14b50523/921-Rozana-Basmati-Rice.jpeg', '1 pack (1 kg)', 100, 0, 4.1, '(4.5k)', 0, 'Daily Choice'],
      ['Daily Good Medium Poha | Avalakki | Indori Poha', 'Medium thickness flattened rice, perfect for breakfast.', 120.00, 75.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-857-860,pr-true,f-auto,q-40,dpr-2/cms/product_variant/5e4e725a-87b9-4cbe-bddd-bdbda9235bc2/Daily-Good-Medium-Poha-Avalakki-Indori-Poha.jpg', '1 pack (1 kg)', 100, 0, 4.6, '(6.0k)', 0, 'Indori Poha'],
      ['Fortune Rozana Gold Basmati Rice', 'Long aromatic basmati rice grains for daily meals.', 120.00, 93.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/2c1c1957-149a-4e68-bf10-a055f2b0fd72/Fortune-Rozana-Gold-Basmati-Rice.jpeg', '1 pack (1 kg)', 100, 0, 4.5, '(38.5k)', 1, 'Bestseller'],
      ['Daily Good Lachkari Kolam Raw Rice', 'Light weightaged Kolam raw rice, perfect texture.', 140.00, 82.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8bf8eb34-8c00-432c-889c-0496323ea175/Daily-Good-Lachkari-Kolam-Raw-Rice.jpeg', '1 pack (1 kg)', 100, 0, 4.8, '(6.2k)', 0, 'Aged Rice'],
      ['Fortune Sona Masoori Supreme Raw Aged Rice', 'Premium raw aged sona masoori rice, supreme quality.', 550.00, 390.00, catMap['Rice'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1001-1001,pr-true,f-auto,q-40,dpr-2/cms/product_variant/7d80c647-1cfe-48f7-8630-9bb21e00865a/Fortune-Sona-Masoori-Supreme-Raw-Aged-Rice.jpg', '1 pack (5 kg)', 100, 0, 4.5, '(4.2k)', 0, 'Supreme Aged'],

      // 14. Hair care
      ['L\'Oreal Paris Hyaluron Moisture 72H Moisture Sealing Conditioner for Dehydrated Hair', 'Conditioner with hyaluronic acid that locks moisture for 72 hours.', 345.00, 232.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/3ece9b40-f59d-4d0a-8ae2-f2b29268118f/L-Oreal-Paris-Hyaluron-Moisture-72H-Moisture-Sealing-Conditioner-for-Dehydrated-Hair.jpeg', '1 pc (175 ml)', 100, 0, 4.5, '(9.0k)', 0, 'Moisture Lock'],
      ['Parachute 100 % Pure Coconut Oil', '100% pure edible coconut oil made from sun-dried coconuts.', 222.00, 187.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-3125-3125,pr-true,f-auto,q-40,dpr-2/cms/product_variant/d7be0405-1cfe-4170-b935-0f17573770dc/Parachute-100-Pure-Coconut-Oil.jpeg', '1 pc (300 ml)', 100, 0, 4.7, '(87.7k)', 1, 'Bestseller'],
      ['Parachute Advansed Men Hair Cream, Anti-Dandruff', 'Daily hair styling cream with lemon and neem to fight dandruff.', 100.00, 84.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/c2babaa6-c323-48eb-bc3f-fd7c255b4046/Parachute-Advansed-Men-Hair-Cream-Anti-Dandruff.jpeg', '1 pc (100 g)', 100, 0, 4.7, '(6.0k)', 0, 'Styling & AntiDandruff'],
      ['Bare Anatomy Rosemary Water Spray for Hair Growth, Thickness & Hairfall Control, 100% Natural', 'Natural rosemary extract spray to boost hair thickness and growth.', 399.00, 359.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8fef2d11-02f8-4f6a-9bef-4f0a755cb7d0/Bare-Anatomy-Rosemary-Water-Spray-for-Hair-Growth-Thickness-Hairfall-Control-100-Natural.jpeg', '1 pc (200 ml)', 100, 0, 4.6, '(818)', 0, '100% Natural'],
      ['Fix My Curls Curl Defining Hair Gel | For Curly, Wavy, Hair, Silicone & Alcohol-Free Hair Gel', 'Styling hair gel that defines curls, alcohol free formulation.', 200.00, 190.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-2000-2000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/23a74e7d-bdf4-407a-aab0-2add9e813786/Fix-My-Curls-Curl-Defining-Hair-Gel-For-Curly-Wavy-Hair-Silicone-Alcohol-Free-Hair-Gel.jpeg', '1 pc (50 g)', 100, 0, 4.5, '(448)', 0, 'Curly Defining'],
      ['Streax Professional Vitariche Gloss Hair Serum', 'Professional glossy hair serum with vitamin E for silky hair.', 220.00, 180.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1000-1000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/1ea28940-1263-4a99-882c-e1289134706a/Streax-Professional-Vitariche%20Gloss-Hair-Serum.jpeg', '1 pc (45 ml)', 100, 0, 4.5, '(5.5k)', 0, 'Vitariche Gloss'],
      ['Bajaj Almond Drops Hair Oil with 2x Hairfall Reduction and 6x Vitamin E & Almond Oil', 'Almond drops hair oil packed with vitamin E for healthy scalp.', 95.00, 87.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-679-679,pr-true,f-auto,q-40,dpr-2/cms/product_variant/d9363cc8-2b3f-4705-b3b0-b55caeab3bc4/Bajaj-Almond-Drops-Hair-Oil-with-2x-Hairfall-Reduction-and-6x-Vitamin-E-Almond-Oil.jpeg', '1 pc (95 ml)', 100, 0, 4.6, '(8.6k)', 0, 'Hair Fall Reduction'],
      ['Pantene Miracle Rescue Biotin Strength Conditioner', 'Advanced biotin conditioner to rescue weak hair strands.', 115.00, 109.00, catMap['Hair care'], 'https://cdn.zeptonow.com/production/ik-seo/tr:w-403,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/01c1fe49-4974-42ab-a384-60e41e64e57e/Pantene-Miracle-Rescue-Biotin-Strength-Conditioner.jpeg', '1 pc (80 ml)', 100, 0, 4.4, '(1.6k)', 0, 'Biotin Strength'],

      // 15. Dal & Pulses
      ['Sri Bhagyalakshmi Fried Gram', 'Premium quality crispy fried gram, perfect for coconut chutneys.', 80.00, 72.00, catMap['Dal & Pulses'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', '1 pack (500 g)', 100, 0, 4.9, '(10.8k)', 0, 'Premium Quality'],
      ['Tata Sampann Unpolished Toor Dal | Arhar Dal', 'Natural unpolished Toor Dal, rich in protein and dietary fiber.', 113.00, 88.00, catMap['Dal & Pulses'], 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', '1 pack (500 g)', 100, 0, 4.9, '(56.9k)', 0, 'Unpolished'],
      ['Daily Good Horse Gram | Kulthi Bean', 'Organic horse gram beans, loaded with iron and micro nutrients.', 100.00, 49.00, catMap['Dal & Pulses'], 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&q=80', '1 pack (500 g)', 100, 0, 4.7, '(5.6k)', 0, 'High Protein'],
      ['Daily Good Unpolished Urad Dal White Whole - Gota', 'Whole white urad dal, ideal for making idli and dosa batters.', 250.00, 155.00, catMap['Dal & Pulses'], 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', '1 pack (1 kg)', 100, 0, 4.8, '(15.7k)', 0, 'Whole Gota'],

      // 16. Personal Hygiene
      ['Nycil Germ Expert Prickly Heat Powder | Cool Herbal', 'Prickly heat powder providing instant cooling and germ protection.', 50.00, 45.00, catMap['Personal Hygiene'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80', '1 pc (50 g)', 100, 0, 4.6, '(1.9k)', 0, 'Cool Herbal'],
      ['Mysore Sandal Talc Powder', 'Talcum powder infused with pure natural sandalwood oil.', 44.00, 41.00, catMap['Personal Hygiene'], 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', '1 pc (100 g)', 100, 0, 4.5, '(246)', 0, 'Sandalwood scent'],
      ['Cinthol Lime Talcum Powder Superior Germ Protection', 'Cooling lime talcum powder keeping you fresh all day.', 190.00, 190.00, catMap['Personal Hygiene'], 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80', '1 pc (300 g)', 100, 0, 4.7, '(1.9k)', 0, 'Lime Protection'],
      ['Pears Pure & Gentle Bathing Soap', 'Bathing soap enriched with 98% pure glycerin for glowing skin.', 164.00, 147.00, catMap['Personal Hygiene'], 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&q=80', '1 pack (4 x 75 g)', 100, 0, 4.7, '(21.5k)', 1, 'Bestseller'],

      // 17. Oils & Ghee
      ['Nandini Ghee | Pouch', 'Pure cow ghee prepared with traditional methods, rich aroma.', 155.00, 150.00, catMap['Oils & Ghee'], 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', '1 pack (200 ml)', 100, 0, 4.7, '(4.6k)', 0, 'Pure Cow Ghee'],

      // 18. Spices & Seasonings
      ['Catch Jeera Whole', 'Whole cumin seeds, selected from clean farms, high aroma.', 70.00, 46.00, catMap['Spices & Seasonings'], 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', '1 pack (100 g)', 100, 0, 4.9, '(83.8k)', 1, 'Bestseller'],

      // 19. Salt, Sugar & Jaggery
      ['Tata Salt | Free Flowing Lodized', 'Vacuum evaporated iodized salt, Indias trusted salt.', 32.00, 27.00, catMap['Salt, Sugar & Jaggery'], 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80', '1 pack (1 kg)', 100, 0, 4.7, '(441.5k)', 1, 'Bestseller'],

      // 20. Chips & Crisps
      ['Bingo! Original Style Chilli Sprinkled Chips', 'Crispy flat-cut potato chips sprinkled with red hot chilli.', 50.00, 37.00, catMap['Chips & Crisps'], 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', '1 pack (85 g)', 100, 0, 4.9, '(142.2k)', 0, 'Chilli Crisps'],

      // 21. Namkeens
      ['Modern Kitchens Butter Murukku', 'Crispy, crunchy butter murukku sticks made with pure butter.', 75.00, 59.00, catMap['Namkeens'], 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', '1 pack (150 g)', 100, 0, 4.7, '(53.8k)', 1, 'Bestseller'],

      // 22. Soft Drinks & Mixers
      ['Coca-Cola Soft Drink', 'Original taste refreshing carbonated beverage.', 45.00, 39.00, catMap['Soft Drinks & Mixers'], 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop', '750 ml', 180, 0, 4.7, '(23.5k)', 0, 'Original Taste'],

      // 23. Juices & Healthy Drinks
      ['Paper Boat Tender Coconut Water', 'Pure, natural refreshing coconut water, no added sugar.', 140.00, 70.00, catMap['Juices & Healthy Drinks'], 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop', '1 pc (180 ml)', 120, 0, 4.2, '(70.4k)', 0, 'Tender Coconut'],

      // 24. Instant Foods
      ['Maggi Double Masala Instant Noodles', 'Tastier double masala instant wheat noodles.', 24.00, 20.00, catMap['Instant Foods'], 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', '1 pack (95 g)', 400, 0, 4.7, '(59.5k)', 0, 'Double Masala'],

      // 25. Dairy Products
      ['Amul Table Butter', 'Classic pasteurized table butter, rich spreads.', 55.00, 40.00, catMap['Dairy Products'], 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop', '100 g', 200, 0, 4.8, '(10.2k)', 1, 'Bestseller'],

      // Newly Seeded Products with Custom Generated Images for Empty Categories
      ['Fresh Chicken Breast', 'Fresh farm chicken breast, high in protein.', 240.00, 199.00, catMap['Meat, Fish & Eggs'], '/chicken_breast.png', '500 g', 100, 1, 4.8, '(5.4k)', 1, 'High Protein'],
      ['Premium Cashew Nuts', 'Whole premium roasted cashews, rich in nutrition.', 299.00, 249.00, catMap['Masala & Dry Fruits'], '/cashew_nuts.png', '200 g', 100, 0, 4.7, '(3.2k)', 0, 'Rich & Healthy'],
      ['Tomato Ketchup', 'Rich tomato ketchup squeeze bottle.', 99.00, 79.00, catMap['Breakfast & Sauces'], '/tomato_ketchup.png', '500 g', 100, 0, 4.6, '(12.1k)', 0, 'Table Top Pick'],
      ['Chocolate Croissant', 'Butter croissant with rich chocolate drizzle.', 120.00, 99.00, catMap['Zepto Cafe'], '/chocolate_croissant.png', '1 pc', 80, 1, 4.9, '(840)', 1, 'Freshly Baked'],
      ['Organic Green Tea', 'Healthy, rich aroma organic green tea bags.', 180.00, 149.00, catMap['Tea, Coffee & More'], '/green_tea.png', '25 bags', 120, 0, 4.8, '(2.3k)', 0, '100% Organic']
    ];

    await connection.query(
      'INSERT INTO products (name, description, price, discount_price, category_id, image_url, unit, stock, is_fresh, rating, rating_count, is_bestseller, special_tag) VALUES ?',
      [productSeeds]
    );
    console.log('Products seeded.');

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = {
  getPool,
  initializeDatabase
};
