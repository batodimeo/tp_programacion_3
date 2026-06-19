const express = require("express");
const router = express.Router();

// GET /admin/login — muestra el formulario de login
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// POST /admin/login — procesa el login (por ahora placeholder)
router.post("/login", (req, res) => {
  res.render("admin/login", { error: "Login en construcción" });
});

module.exports = router;
