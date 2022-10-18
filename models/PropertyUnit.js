const { Sequelize, DataTypes, Model } = require("sequelize");

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
  street_address: {
    type: DataTypes.STRING,
  },
  province: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  barangay: {
    type: DataTypes.STRING,
  },
  zip: {
    type: DataTypes.STRING,
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
