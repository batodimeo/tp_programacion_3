const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const DetalleVenta = sequelize.define("DetalleVenta", {
  nombreProducto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precioUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = DetalleVenta;
