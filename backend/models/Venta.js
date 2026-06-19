const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Venta = sequelize.define("Venta", {
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = Venta;
