import sqlite3 from 'sqlite3';
import path from 'path';

// Vercel serverless limits file system writes to /tmp/
const dbPath = process.env.VERCEL ? '/tmp/inventory.db' : path.resolve(__dirname, './inventory.db');
const db = new sqlite3.Database(dbPath);

export const initDb = () => {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            // Drop existing tables for a clean start
            db.run('DROP TABLE IF EXISTS Inventory');
            db.run('DROP TABLE IF EXISTS Suppliers');

            // Create Suppliers table
            db.run(`
                CREATE TABLE Suppliers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    city TEXT NOT NULL
                )
            `);

            // Create Inventory table
            db.run(`
                CREATE TABLE Inventory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    supplier_id INTEGER NOT NULL,
                    product_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    quantity INTEGER NOT NULL CHECK(quantity >= 0),
                    price REAL NOT NULL CHECK(price > 0),
                    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id)
                )
            `);

            // Seed Suppliers
            const suppliers = [
                ['EcoPower Inc.', 'New York'],
                ['Global Turbine Solutions', 'Chicago'],
                ['Industrial Surplus Co.', 'Houston'],
                ['Renewable Parts Ltd.', 'San Francisco']
            ];

            const stmtSupplier = db.prepare('INSERT INTO Suppliers (name, city) VALUES (?, ?)');
            suppliers.forEach(s => stmtSupplier.run(s));
            stmtSupplier.finalize();

            // Seed Inventory (12 records)
            const inventory = [
                [1, 'Wind Turbine Blade VX-1', 'Turbines', 10, 15000.00],
                [1, 'Solar Panel High-Efficiency', 'Solar', 50, 450.00],
                [2, 'Heavy-Duty Gas Turbine', 'Turbines', 2, 85000.00],
                [2, 'Turbine Bearing Set', 'Maintenance', 25, 1200.00],
                [3, 'Control Panel V4', 'Electronics', 15, 3200.00],
                [3, 'Backup Generator 50kW', 'Generators', 5, 12500.00],
                [4, 'Hydro-Pump Assembly', 'Hydro', 8, 8900.00],
                [4, 'Lubrication System K-9', 'Maintenance', 12, 1500.00],
                [1, 'Inverter Pro 5000', 'Solar', 20, 2100.00],
                [2, 'Transmission Gearbox Z2', 'Turbines', 3, 24000.00],
                [3, 'Emergency Stop Switch', 'Electronics', 100, 45.00],
                [4, 'Voltage Regulator Auto', 'Electronics', 30, 250.00]
            ];

            const stmtInventory = db.prepare('INSERT INTO Inventory (supplier_id, product_name, category, quantity, price) VALUES (?, ?, ?, ?, ?)');
            inventory.forEach(i => stmtInventory.run(i));
            stmtInventory.finalize(() => {
                console.log('Database initialized and seeded.');
                resolve();
            });
        });
    });
};

export default db;
