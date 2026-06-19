const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

// Middleware para proteger rutas del panel
function verificarSesion(req, res, next) {
  if (req.session.adminLogueado) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

// GET /admin/login — muestra el formulario
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// POST /admin/login — procesa el login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el admin por email
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.render("admin/login", { error: "Email o contraseña incorrectos" });
    }

    // Comparar la contraseña con el hash guardado
    const coincide = await bcrypt.compare(password, admin.password);

    if (!coincide) {
      return res.render("admin/login", { error: "Email o contraseña incorrectos" });
    }

    // Guardar en la sesión que está logueado
    req.session.adminLogueado = true;
    req.session.adminEmail = admin.email;

    res.redirect("/admin/dashboard");

  } catch (error) {
    console.error(error);
    res.render("admin/login", { error: "Error del servidor" });
  }
});

// GET /admin/logout — cierra la sesión
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// GET /admin/dashboard — panel principal (protegido)
router.get("/dashboard", verificarSesion, (req, res) => {
  res.render("admin/dashboard", { email: req.session.adminEmail });
});

// ── PRODUCTOS ──────────────────────────────────────────────

const Producto = require("../models/Producto");

// GET /admin/productos — lista todos los productos
router.get("/productos", verificarSesion, async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.render("admin/productos", { productos, email: req.session.adminEmail });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar productos");
  }
});

// POST /admin/productos/toggleActivo — activa o desactiva un producto
router.post("/productos/toggleActivo", verificarSesion, async (req, res) => {
  const { id } = req.body;
  try {
    const producto = await Producto.findByPk(id);
    if (producto) {
      producto.activo = !producto.activo;
      await producto.save();
    }
    res.redirect("/admin/productos");
  } catch (error) {
    console.error(error);
    res.send("Error al actualizar producto");
  }
});

// GET /admin/productos/editar/:id — formulario de edición
router.get("/productos/editar/:id", verificarSesion, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.redirect("/admin/productos");
    res.render("admin/editarProducto", { producto, email: req.session.adminEmail });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar el producto");
  }
});

// POST /admin/productos/editar/:id — guarda los cambios
router.post("/productos/editar/:id", verificarSesion, async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (producto) {
      producto.nombre      = nombre;
      producto.descripcion = descripcion;
      producto.precio      = parseFloat(precio);
      await producto.save();
    }
    res.redirect("/admin/productos");
  } catch (error) {
    console.error(error);
    res.send("Error al guardar cambios");
  }
});

// ── VENTAS ──────────────────────────────────────────────

const Venta = require("../models/Venta");
const DetalleVenta = require("../models/DetalleVenta");

// GET /admin/ventas — lista todas las ventas
router.get("/ventas", verificarSesion, async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.render("admin/ventas", { ventas, email: req.session.adminEmail });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar ventas");
  }
});

// GET /admin/ventas/:id — detalle de una venta
router.get("/ventas/:id", verificarSesion, async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.redirect("/admin/ventas");

    const detalles = await DetalleVenta.findAll({ where: { VentaId: venta.id } });
    res.render("admin/detalleVenta", { venta, detalles, email: req.session.adminEmail });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar la venta");
  }
});

module.exports = router;
