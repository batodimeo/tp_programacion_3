const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Esto va a crear el archivo 'tienda.sqlite' automáticamente en la raíz de /backend
const dbPath = path.join(__dirname, '../tienda.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la Base de Datos:', err.message);
    } else {
        console.log('Base de datos SQLite conectada exitosamente.');
    }
});

db.serialize(() => {
    // 1. Crear tabla de Usuarios (Administradores)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // 2. Crear tabla de Productos
    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        precio REAL,
        categoria TEXT,
        imagen TEXT,
        activo INTEGER DEFAULT 1
    )`);

    // 3. Plantar al administrador por defecto si la base de datos está vacía
    const adminEmail = 'admin123@gmail.com';
    const adminPassTextoPuro = 'admin123';

    db.get("SELECT * FROM usuarios WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
            // Encriptamos la contraseña ANTES de guardarla
            const salt = bcrypt.genSaltSync(10);
            const passwordEncriptada = bcrypt.hashSync(adminPassTextoPuro, salt);

            db.run("INSERT INTO usuarios (email, password) VALUES (?, ?)", [adminEmail, passwordEncriptada], (err) => {
                if (err) {
                    console.error("Error insertando al admin:", err);
                } else {
                    console.log(` Admin por defecto sembrado con éxito -> Email: ${adminEmail}`);
                }
            });
        }
    });
});

module.exports = db;