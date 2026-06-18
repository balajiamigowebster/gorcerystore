const express = require('express');
const cors = require('cors');
const { initializeDatabase, getPool } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// 2. Get Products (with search & category filters)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const pool = await getPool();
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category) {
      query += ' WHERE p.category_id = ?';
      params.push(category);
    } else if (search) {
      query += ' WHERE p.name LIKE ? OR p.description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.id ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// 3. Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// 4. Place Order
app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, deliveryAddress, items, totalAmount, deliveryFee, handlingFee } = req.body;

  if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert order record
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_name, customer_phone, delivery_address, total_amount, delivery_fee, handling_fee) VALUES (?, ?, ?, ?, ?, ?)',
      [customerName, customerPhone, deliveryAddress, totalAmount, deliveryFee || 0, handlingFee || 4.00]
    );
    const orderId = orderResult.insertId;

    // 2. Process items
    for (const item of items) {
      // Check stock
      const [productRows] = await connection.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.productId]);
      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found`);
      }
      
      const currentStock = productRows[0].stock;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${productRows[0].name}. Available: ${currentStock}, Requested: ${item.quantity}`);
      }

      // Insert order item
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    res.status(201).json({ 
      success: true, 
      orderId, 
      message: 'Order placed successfully',
      status: 'Confirmed'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Order placement transaction rolled back due to error:', error);
    res.status(400).json({ error: error.message || 'Failed to place order' });
  } finally {
    connection.release();
  }
});

// 5. Get Order Tracking Details
app.get('/api/orders/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [itemRows] = await pool.query(`
      SELECT oi.*, p.name, p.image_url, p.unit 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({
      order: orderRows[0],
      items: itemRows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// 6. Admin Panel Statistics Endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Total Sales & Total Orders
    const [salesRows] = await pool.query('SELECT IFNULL(SUM(total_amount), 0) as totalRevenue, COUNT(*) as totalOrders FROM orders');
    
    // Product count
    const [productCountRows] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
    
    // Top-selling products
    const [topSellingRows] = await pool.query(`
      SELECT p.name, SUM(oi.quantity) as unitsSold, SUM(oi.quantity * oi.price) as revenue, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id
      ORDER BY unitsSold DESC
      LIMIT 5
    `);

    // Recent orders
    const [recentOrdersRows] = await pool.query(`
      SELECT id, customer_name, total_amount, status, created_at 
      FROM orders 
      ORDER BY id DESC 
      LIMIT 8
    `);

    // Low stock items
    const [lowStockRows] = await pool.query(`
      SELECT name, stock, unit, price, image_url 
      FROM products 
      WHERE stock < 15 
      ORDER BY stock ASC
    `);

    res.json({
      summary: {
        totalRevenue: parseFloat(salesRows[0].totalRevenue),
        totalOrders: salesRows[0].totalOrders,
        totalProducts: productCountRows[0].totalProducts
      },
      topProducts: topSellingRows,
      recentOrders: recentOrdersRows,
      lowStock: lowStockRows
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// 7. Admin: Get All Orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 8. Admin: Update Order Status
app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
  try {
    const pool = await getPool();
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 9. Admin: Add New Product
app.post('/api/products', async (req, res) => {
  const { 
    name, description, price, discount_price, category_id, 
    image_url, unit, stock, is_fresh, is_bestseller, special_tag 
  } = req.body;

  if (!name || !price || !category_id || !unit) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  try {
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO products (
        name, description, price, discount_price, category_id, 
        image_url, unit, stock, is_fresh, is_bestseller, special_tag
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        description || '', 
        price, 
        discount_price !== undefined && discount_price !== '' ? discount_price : null, 
        category_id, 
        image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 
        unit, 
        stock !== undefined && stock !== '' ? stock : 100, 
        is_fresh ? 1 : 0, 
        is_bestseller ? 1 : 0, 
        special_tag || null
      ]
    );
    res.status(201).json({ success: true, productId: result.insertId, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// 10. Admin: Update Product SKU
app.put('/api/products/:id', async (req, res) => {
  const { 
    name, description, price, discount_price, category_id, 
    image_url, unit, stock, is_fresh, is_bestseller, special_tag 
  } = req.body;

  if (!name || !price || !category_id || !unit) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  try {
    const pool = await getPool();
    await pool.query(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        price = ?, 
        discount_price = ?, 
        category_id = ?, 
        image_url = ?, 
        unit = ?, 
        stock = ?, 
        is_fresh = ?, 
        is_bestseller = ?, 
        special_tag = ?
      WHERE id = ?`,
      [
        name, 
        description || '', 
        price, 
        discount_price !== undefined && discount_price !== '' && discount_price !== null ? discount_price : null, 
        category_id, 
        image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 
        unit, 
        stock !== undefined && stock !== '' ? stock : 100, 
        is_fresh ? 1 : 0, 
        is_bestseller ? 1 : 0, 
        special_tag || null,
        req.params.id
      ]
    );
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});


// Export app for serverless deployment
module.exports = app;

// Start server locally if not on Vercel
if (!process.env.VERCEL) {
  async function start() {
    try {
      await initializeDatabase();
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error('Unable to start Express server:', error);
      process.exit(1);
    }
  }
  start();
}
