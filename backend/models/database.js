const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../tienda.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
    else console.log('Base de datos SQLite conectada.');
});

db.serialize(() => {
    // 1. Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // 2. Productos
    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        precio REAL,
        categoria TEXT,
        imagen TEXT,
        activo INTEGER DEFAULT 1
    )`);

    // 3. TABLA VENTAS (Cabecera del ticket)
    db.run(`CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT,
        fecha TEXT,
        total REAL
    )`);

    // 4. TABLA INTERMEDIA N:M (El detalle de qué compró y cuántos)
    db.run(`CREATE TABLE IF NOT EXISTS ventas_productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER,
        precio_unitario REAL,
        FOREIGN KEY(venta_id) REFERENCES ventas(id),
        FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    // Sembrar Admin por defecto
    const adminEmail = 'admin123@gmail.com';
    db.get("SELECT * FROM usuarios WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
            const salt = bcrypt.genSaltSync(10);
            db.run("INSERT INTO usuarios (email, password) VALUES (?, ?)", [adminEmail, bcrypt.hashSync('admin123', salt)]);
        }
    });
});

module.exports = db;