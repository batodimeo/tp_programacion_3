const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <-- AGREGAMOS ESTE MÓDULO NATIVO DE NODE

// ==========================================
// CONFIGURACIÓN DE MULTER (CON AUTOCREACIÓN DE CARPETA)
// ==========================================
const dirImagen = path.join(__dirname, '../public/img');

// Magia: Si la carpeta 'img' no existe, Node la crea automáticamente en este instante
if (!fs.existsSync(dirImagen)) {
    fs.mkdirSync(dirImagen, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirImagen);
    },
    filename: (req, file, cb) => {
        const nombreLimpio = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, nombreLimpio);
    }
});
const upload = multer({ storage });

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, usuario) => {
        if (err || !usuario) {
            return res.render('admin/login', { error: 'Correo no encontrado.' });
        }
        if (bcrypt.compareSync(password, usuario.password)) {
            req.session.adminLogueado = true;
            req.session.adminEmail = usuario.email;
            return res.redirect('/admin/dashboard'); 
        } else {
            return res.render('admin/login', { error: 'Contraseña incorrecta.' });
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});


// ==========================================
// 2. DASHBOARD Y ESTADO
// ==========================================
router.get('/dashboard', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    db.all("SELECT * FROM productos", [], (err, productos) => {
        res.render('admin/dashboard', { 
            emailAdmin: req.session.adminEmail,
            productos: productos || []
        });
    });
});

router.post('/productos/estado/:id', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    db.get("SELECT activo FROM productos WHERE id = ?", [req.params.id], (err, prod) => {
        if (prod) {
            const nuevoEstado = prod.activo === 1 ? 0 : 1;
            db.run("UPDATE productos SET activo = ? WHERE id = ?", [nuevoEstado, req.params.id], () => {
                res.redirect('/admin/dashboard');
            });
        } else {
            res.redirect('/admin/dashboard');
        }
    });
});


// ==========================================
// 3. ALTA DE PRODUCTO
// ==========================================
// GET: Mostrar formulario vacío
router.get('/productos/nuevo', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    res.render('admin/formulario', { producto: null });
});

// POST: Recibir datos e imagen del nuevo producto
router.post('/productos/nuevo', upload.single('imagen'), (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    const { nombre, precio, categoria } = req.body;
    const imagen = req.file ? req.file.filename : 'sin-imagen.png';

    db.run(
        "INSERT INTO productos (nombre, precio, categoria, imagen, activo) VALUES (?, ?, ?, ?, 1)",
        [nombre, precio, categoria, imagen],
        (err) => {
            if (err) console.error(err);
            res.redirect('/admin/dashboard');
        }
    );
});


// ==========================================
// 4. MODIFICACIÓN DE PRODUCTO
// ==========================================
// GET: Mostrar formulario lleno con los datos del ID
router.get('/productos/editar/:id', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, producto) => {
        if (!producto) return res.redirect('/admin/dashboard');
        res.render('admin/formulario', { producto });
    });
});

// POST: Impactar los cambios en SQLite
router.post('/productos/editar/:id', upload.single('imagen'), (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    const { nombre, precio, categoria } = req.body;
    const { id } = req.params;

    if (req.file) {
        // Si el usuario subió una foto nueva, actualizamos el campo imagen
        db.run(
            "UPDATE productos SET nombre = ?, precio = ?, categoria = ?, imagen = ? WHERE id = ?",
            [nombre, precio, categoria, req.file.filename, id],
            () => res.redirect('/admin/dashboard')
        );
    } else {
        // Si NO subió foto, actualizamos los textos pero le dejamos la imagen que ya tenía
        db.run(
            "UPDATE productos SET nombre = ?, precio = ?, categoria = ? WHERE id = ?",
            [nombre, precio, categoria, id],
            () => res.redirect('/admin/dashboard')
        );
    }
});

module.exports = router;