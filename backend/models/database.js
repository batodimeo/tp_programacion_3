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

    // 2. Productos (¡AHORA CON COLUMNA DESCRIPCION!)
    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        descripcion TEXT,
        precio REAL,
        categoria TEXT,
        imagen TEXT,
        activo INTEGER DEFAULT 1
    )`);

    // 3. Ventas
    db.run(`CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT,
        fecha TEXT,
        total REAL
    )`);

    // 4. Ventas_Productos (N:M)
    db.run(`CREATE TABLE IF NOT EXISTS ventas_productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER,
        precio_unitario REAL,
        FOREIGN KEY(venta_id) REFERENCES ventas(id),
        FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    // Sembrar Admin
    const adminEmail = 'admin123@gmail.com';
    db.get("SELECT * FROM usuarios WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
            const salt = bcrypt.genSaltSync(10);
            db.run("INSERT INTO usuarios (email, password) VALUES (?, ?)", [adminEmail, bcrypt.hashSync('admin123', salt)]);
        }
    });

    // Sembrar Catálogo con Descripciones Reales
    db.get("SELECT COUNT(*) as cant FROM productos", (err, row) => {
        if (row.cant === 0) {
            const catalogoBase = [
                ["Elden Ring - Shadow of the Erdtree", "Expansión masiva del aclamado RPG de acción de FromSoftware.", 48000, "juegos", "eldenring.png"],
                ["God of War Ragnarök", "El épico y brutal cierre de la saga nórdica de Kratos y Atreus.", 42000, "juegos", "godofwar.png"],
                ["Cyberpunk 2077: Ultimate Edition", "Edición definitiva del RPG futurista, incluye expansión Phantom Liberty.", 39000, "juegos", "cyberpunk.png"],
                ["Joystick PS5 DualSense Midnight Black", "Control inalámbrico oficial con retroalimentación háptica de última generación.", 75000, "accesorios", "joystick.png"],
                ["Auriculares Pulse 3D Wireless", "Audio 3D inmersivo diseñado específicamente para la consola PlayStation 5.", 85000, "accesorios", "auriculares.png"],
                ["Teclado Mecánico HyperX Alloy Origins", "Estructura de aluminio aeronáutico y switches mecánicos HyperX Red.", 62000, "accesorios", "teclado.png"]
            ];

            const stmt = db.prepare("INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, activo) VALUES (?, ?, ?, ?, ?, 1)");
            catalogoBase.forEach(prod => stmt.run(...prod));
            stmt.finalize();
            console.log(" Catálogo de 6 productos sembrado con descripciones.");
        }
    });
});

module.exports = router = db;