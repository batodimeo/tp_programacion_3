const sequelize = require("./models/index");

// Importar modelos para que Sequelize los registre
require("./models/Producto");
require("./models/Venta");
require("./models/DetalleVenta");
require("./models/Admin");

// Sincroniza los modelos con la base de datos (crea las tablas si no existen)
async function iniciarDB() {
  try {
    await sequelize.sync();
    console.log("Base de datos conectada y tablas creadas");
  } catch (error) {
    console.error("Error al conectar la base de datos:", error);
  }
}

module.exports = iniciarDB;
