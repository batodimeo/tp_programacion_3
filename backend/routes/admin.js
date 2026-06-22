const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');

// GET: Pantalla de Login
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// POST: Procesar Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, usuario) => {
        if (err || !usuario) {
            return res.render('admin/login', { error: 'Ese correo no figura en la base de datos.' });
        }

        const claveValida = bcrypt.compareSync(password, usuario.password);

        if (claveValida) {
            req.session.adminLogueado = true;
            req.session.adminEmail = usuario.email;
            return res.redirect('/admin/dashboard'); 
        } else {
            return res.render('admin/login', { error: 'Contraseña incorrecta.' });
        }
    });
});

// GET: Dashboard de administración (Protegido por sesión)
router.get('/dashboard', (req, res) => {
    if (!req.session.adminLogueado) {
        return res.redirect('/admin/login');
    }

    // Traemos todos los productos de la base de datos
    db.all("SELECT * FROM productos", [], (err, productos) => {
        if (err) {
            productos = [];
        }
        res.render('admin/dashboard', { 
            emailAdmin: req.session.adminEmail,
            productos: productos
        });
    });
});

// POST: Cambiar estado (Alta/Baja lógica)
router.post('/productos/estado/:id', (req, res) => {
    if (!req.session.adminLogueado) {
        return res.redirect('/admin/login');
    }

    const { id } = req.params;

    // Primero consultamos el estado actual del producto
    db.get("SELECT activo FROM productos WHERE id = ?", [id], (err, prod) => {
        if (prod) {
            // Si estaba en 1 pasa a 0, si estaba en 0 pasa a 1
            const nuevoEstado = prod.activo === 1 ? 0 : 1;
            
            db.run("UPDATE productos SET activo = ? WHERE id = ?", [nuevoEstado, id], (err) => {
                res.redirect('/admin/dashboard');
            });
        } else {
            res.redirect('/admin/dashboard');
        }
    });
});

// GET: Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;