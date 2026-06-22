const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx'); // <-- 1. LIBRERÍA DE EXCEL AGREGADA

// Configuración de Multer (Imágenes)
const dirImagen = path.join(__dirname, '../public/img');
if (!fs.existsSync(dirImagen)) {
    fs.mkdirSync(dirImagen, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dirImagen),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });


// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
router.get('/login', (req, res) => res.render('admin/login', { error: null }));

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, usuario) => {
        if (err || !usuario) return res.render('admin/login', { error: 'Correo no encontrado.' });
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
// 2. DASHBOARD (CON PRODUCTOS Y VENTAS)
// ==========================================
router.get('/dashboard', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    // Hacemos dos consultas: los productos por un lado, y las ventas por el otro
    db.all("SELECT * FROM productos", [], (err, productos) => {
        db.all("SELECT * FROM ventas ORDER BY id DESC", [], (err, ventas) => {
            res.render('admin/dashboard', { 
                emailAdmin: req.session.adminEmail,
                productos: productos || [],
                ventas: ventas || []
            });
        });
    });
});

router.post('/productos/estado/:id', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    db.get("SELECT activo FROM productos WHERE id = ?", [req.params.id], (err, prod) => {
        if (prod) {
            const nuevoEstado = prod.activo === 1 ? 0 : 1;
            db.run("UPDATE productos SET activo = ? WHERE id = ?", [nuevoEstado, req.params.id], () => res.redirect('/admin/dashboard'));
        } else res.redirect('/admin/dashboard');
    });
});


// ==========================================
// 3. EXCEL DE VENTAS (REQUISITO PROFESORES)
// ==========================================
router.get('/ventas/excel', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');

    const sqlExcel = `
        SELECT 
            v.id AS "N° Ticket", 
            v.cliente AS "Cliente", 
            v.fecha AS "Fecha", 
            p.nombre AS "Producto Comprado", 
            vp.cantidad AS "Cantidad", 
            vp.precio_unitario AS "Precio Unit.", 
            (vp.cantidad * vp.precio_unitario) AS "Subtotal"
        FROM ventas v
        JOIN ventas_productos vp ON v.id = vp.venta_id
        JOIN productos p ON vp.producto_id = p.id
        ORDER BY v.id DESC
    `;

    db.all(sqlExcel, [], (err, filas) => {
        if (err || !filas || filas.length === 0) {
            return res.send('<script>alert("No hay ninguna venta registrada para exportar."); window.location.href="/admin/dashboard";</script>');
        }

        // Magia: convierte el resultado de SQL a una hoja de Excel real
        const worksheet = XLSX.utils.json_to_sheet(filas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Ventas");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Ventas_ArgenGaming.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(excelBuffer);
    });
});


// ==========================================
// 4. ALTAS Y MODIFICACIONES
// ==========================================
router.get('/productos/nuevo', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    res.render('admin/formulario', { producto: null });
});

router.post('/productos/nuevo', upload.single('imagen'), (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    
    // 1. INYECTAMOS 'descripcion' EN LA DESESTRUCTURACIÓN
    const { nombre, descripcion, precio, categoria } = req.body; 
    const imagen = req.file ? req.file.filename : 'sin-imagen.png';

    // 2. AGREGAMOS EL CAMPO AL INSERT DE SQL
    db.run(
        "INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, activo) VALUES (?, ?, ?, ?, ?, 1)", 
        [nombre, descripcion, precio, categoria, imagen], 
        () => res.redirect('/admin/dashboard')
    );
});

router.get('/productos/editar/:id', (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, producto) => {
        if (!producto) return res.redirect('/admin/dashboard');
        res.render('admin/formulario', { producto });
    });
});

router.post('/productos/editar/:id', upload.single('imagen'), (req, res) => {
    if (!req.session.adminLogueado) return res.redirect('/admin/login');
    
    // 3. INYECTAMOS 'descripcion' TAMBIÉN EN LA EDICIÓN
    const { nombre, descripcion, precio, categoria } = req.body; 
    const { id } = req.params;

    if (req.file) {
        db.run(
            "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ? WHERE id = ?", 
            [nombre, descripcion, precio, categoria, req.file.filename, id], 
            () => res.redirect('/admin/dashboard')
        );
    } else {
        db.run(
            "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ? WHERE id = ?", 
            [nombre, descripcion, precio, categoria, id], 
            () => res.redirect('/admin/dashboard')
        );
    }
});

module.exports = router;