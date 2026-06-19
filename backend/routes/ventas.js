const express = require("express");
const router = express.Router();
const Venta = require("../models/Venta");
const DetalleVenta = require("../models/DetalleVenta");

// POST /api/ventas — guarda una venta con sus detalles
router.post("/", async (req, res) => {
  try {
    const { nombreCliente, carrito } = req.body;

    if (!nombreCliente || !carrito || carrito.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    // Crear la venta
    const venta = await Venta.create({ nombreCliente, total });

    // Crear los detalles
    for (const item of carrito) {
      await DetalleVenta.create({
        VentaId: venta.id,
        nombreProducto: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad
      });
    }

    res.json({ mensaje: "Venta registrada", ventaId: venta.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la venta" });
  }
});

module.exports = router;
