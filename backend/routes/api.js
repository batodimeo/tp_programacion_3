const express = require('express');
const router = express.Router();
const db = require('../models/database');

// ========================================================
// 1. GET: Devolver catálogo de productos activos al Front
// ========================================================
router.get('/productos', (req, res) => {
    db.all("SELECT * FROM productos WHERE activo = 1", [], (err, filas) => {
        if (err) return res.status(500).json({ error: "Error de DB" });
        res.json(filas);
    });
});

// ========================================================
// 2. POST: Recibir el carrito y guardar la Venta (N:M)
// ========================================================
router.post('/comprar', (req, res) => {
    const { cliente, total, carrito } = req.body;

    if (!cliente || !carrito || carrito.length === 0) {
        return res.status(400).json({ error: "Datos de compra incompletos." });
    }

    const fechaHoy = new Date().toISOString().split('T')[0];

    // Insertamos la cabecera del ticket
    db.run(
        "INSERT INTO ventas (cliente, fecha, total) VALUES (?, ?, ?)",
        [cliente, fechaHoy, total],
        function (err) {
            if (err) {
                console.error("Error insertando venta:", err);
                return res.status(500).json({ error: "No se pudo registrar la venta." });
            }

            const idVentaGenerada = this.lastID; // Captura el ID del ticket

            // Preparamos la inserción múltiple para la tabla intermedia
            const stmt = db.prepare("INSERT INTO ventas_productos (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");

            carrito.forEach(item => {
                stmt.run(idVentaGenerada, item.id, item.cantidad, item.precio);
            });

            stmt.finalize();

            res.json({ 
                success: true, 
                id_venta: idVentaGenerada, 
                mensaje: "¡Venta guardada con éxito!" 
            });
        }
    );
});

// ========================================================
// 3. GET: Traer un ticket específico con sus productos (JOIN)
// ========================================================
router.get('/ventas/:id', (req, res) => {
    const idVenta = req.params.id;

    db.get("SELECT * FROM ventas WHERE id = ?", [idVenta], (err, venta) => {
        if (err || !venta) {
            return res.status(404).json({ error: "Ticket no encontrado" });
        }

        // Hacemos el JOIN N:M para traer qué productos tiene adentro
        const sqlDetalle = `
            SELECT p.nombre, p.imagen, vp.cantidad, vp.precio_unitario as precio
            FROM ventas_productos vp
            JOIN productos p ON vp.producto_id = p.id
            WHERE vp.venta_id = ?
        `;

        db.all(sqlDetalle, [idVenta], (err, productosComprados) => {
            res.json({
                id_ticket: venta.id,
                cliente: venta.cliente,
                fecha: venta.fecha,
                total: venta.total,
                empresa: "ArgenGaming S.A.", // Requisito del PDF
                productos: productosComprados || []
            });
        });
    });
});

// ¡ESTA ES LA LÍNEA MÁGICA QUE SE TE HABÍA BORRADO!
module.exports = router;