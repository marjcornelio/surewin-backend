const { Sequelize, DataTypes, Model, UUIDV4 } = require("sequelize");

const sequelize = require("../db/connect");

const Unit = sequelize.define("unit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  unit_title: {
    type: DataTypes.STRING,
  },
  property_type: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  floor_area: {
    type: DataTypes.INTEGER,
  },
  rental_amount: {
    type: DataTypes.INTEGER,
  },
  image: {
    type: DataTypes.STRING,
  },
  manager: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["vacant", "occupied", "unavailable"],
  },
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table: ");
  });

module.exports = Unit;
