const bcrypt = require("bcrypt");
const iniciarDB = require("./database");
const Admin = require("./models/Admin");

async function crearAdmin() {
  await iniciarDB();

  const existe = await Admin.findOne({ where: { email: "admin@argengaming.com" } });

  if (existe) {
    console.log("El admin ya existe.");
    process.exit();
  }

  const hash = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "admin@argengaming.com",
    password: hash
  });

  console.log("Admin creado correctamente.");
  console.log("Email:    admin@argengaming.com");
  console.log("Password: admin123");
  process.exit();
}

crearAdmin();
