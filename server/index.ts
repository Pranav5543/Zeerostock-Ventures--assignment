import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let dbBootError: any = null;

// Initialize Database on startup
initDb().then(() => {
    console.log('Database Ready.');
}).catch(err => {
    console.error('Database Init Error:', err);
    dbBootError = err.message || String(err);
});

app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'Server is running',
        dbError: dbBootError,
        env: process.env.VERCEL ? 'Vercel' : 'Local'
    });
});

/**
 * ASSIGNMENT A: Search API
 * GET /search?q=...&category=...&minPrice=...&maxPrice=...
 */
app.get('/search', (req: Request, res: Response) => {
    if (dbBootError) return res.status(500).json({ error: 'DB Failed to boot: ' + dbBootError });
    
    const { q, category, minPrice, maxPrice } = req.query;

    let sql = 'SELECT * FROM Inventory WHERE 1=1';
    const params: any[] = [];

    if (q) {
        sql += ' AND product_name LIKE ?';
        params.push(`%${q}%`);
    }

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }

    if (minPrice) {
        const min = parseFloat(minPrice as string);
        if (isNaN(min)) return res.status(400).json({ error: 'Invalid minPrice' });
        sql += ' AND price >= ?';
        params.push(min);
    }

    if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        if (isNaN(max)) return res.status(400).json({ error: 'Invalid maxPrice' });
        sql += ' AND price <= ?';
        params.push(max);
    }

    // Rule: Price Range Validation
    if (minPrice && maxPrice && parseFloat(minPrice as string) > parseFloat(maxPrice as string)) {
        return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * ASSIGNMENT B: Database APIs
 */

// Create Supplier
app.post('/supplier', (req: Request, res: Response) => {
    const { name, city } = req.body;
    if (!name || !city) return res.status(400).json({ error: 'Name and city are required' });

    db.run('INSERT INTO Suppliers (name, city) VALUES (?, ?)', [name, city], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, city });
    });
});

// Create Inventory
app.post('/inventory', (req: Request, res: Response) => {
    const { supplier_id, product_name, category, quantity, price } = req.body;

    if (!supplier_id || !product_name || !category || quantity === undefined || price === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (quantity < 0) return res.status(400).json({ error: 'Quantity must be >= 0' });
    if (price <= 0) return res.status(400).json({ error: 'Price must be > 0' });

    // Validate supplier existence
    db.get('SELECT id FROM Suppliers WHERE id = ?', [supplier_id], (err, supplier) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!supplier) return res.status(400).json({ error: 'Invalid supplier_id' });

        db.run(
            'INSERT INTO Inventory (supplier_id, product_name, category, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [supplier_id, product_name, category, quantity, price],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, supplier_id, product_name, category, quantity, price });
            }
        );
    });
});

/**
 * REQUIRED QUERY: Group inventory by supplier, sorted by total value
 */
app.get('/inventory', (req: Request, res: Response) => {
    const sql = `
        SELECT 
            s.id as supplier_id,
            s.name as supplier_name,
            s.city as supplier_city,
            GROUP_CONCAT(i.product_name) as products,
            SUM(i.quantity * i.price) as total_inventory_value
        FROM Suppliers s
        LEFT JOIN Inventory i ON s.id = i.supplier_id
        GROUP BY s.id
        ORDER BY total_inventory_value DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Format the products list from string to array
        const formattedRows = rows.map((row: any) => ({
            ...row,
            products: row.products ? row.products.split(',') : []
        }));
        
        res.json(formattedRows);
    });
});

// Delete Inventory Item
app.delete('/inventory/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.run('DELETE FROM Inventory WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted_id: id });
    });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
