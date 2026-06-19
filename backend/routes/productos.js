const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

// GET /api/productos — devuelve todos los productos activos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.findAll({ where: { activo: true } });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

module.exports = router;
