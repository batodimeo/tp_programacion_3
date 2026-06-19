const { Sequelize } = require("sequelize");
const path = require("path");

// Base de datos SQLite — se crea sola en la carpeta backend
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../database.sqlite"),
  logging: false
});

module.exports = sequelize;
