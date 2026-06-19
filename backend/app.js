const express = require("express");
const path = require("path");
const iniciarDB = require("./database");

const app = express();
const PORT = 3000;

// Motor de vistas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rutas
const productosRouter = require("./routes/productos");
const ventasRouter    = require("./routes/ventas");
const adminRouter     = require("./routes/admin");

app.use("/api/productos", productosRouter);
app.use("/api/ventas",    ventasRouter);
app.use("/admin",         adminRouter);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Backend ArgenGaming funcionando" });
});

// Iniciar base de datos y luego servidor
iniciarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
